import axios from 'axios';
import type { Server } from 'http';
import { URL } from 'url';
import dotenv from 'dotenv';
dotenv.config();


const WebSocket = require('ws');

const AI_CHATBOT_URL =
  process.env.AI_CHATBOT_URL || 'http://72.62.213.212:8000/api/voice/quote-follow-up';
const AI_CHATBOT_INITIAL_URL =
  process.env.AI_CHATBOT_INITIAL_URL || `${AI_CHATBOT_URL.replace(/\/$/, '')}/initial`;
const STREAM_PATH = '/api/v1/call/ai-stream';
const AUDIO_FLUSH_MS = 800;
const AUDIO_SAMPLE_RATE = 8000;
const MAX_BUFFERED_AUDIO_BYTES =
  Number(process.env.TWILIO_MAX_BUFFERED_AUDIO_BYTES) || 512 * 1024;
const AI_AUDIO_FORMAT = (process.env.AI_CHATBOT_AUDIO_FORMAT || 'wav').toLowerCase();

type TwilioStreamMessage = {
  event: string;
  streamSid?: string;
  start?: {
    streamSid?: string;
    callSid?: string;
    customParameters?: Record<string, string>;
  };
  media?: {
    payload?: string;
  };
};

function muLawByteToPcm16(muLawByte: number): number {
  const value = ~muLawByte & 0xff;
  const sign = value & 0x80;
  const exponent = (value >> 4) & 0x07;
  const mantissa = value & 0x0f;
  let sample = ((mantissa << 3) + 0x84) << exponent;

  sample -= 0x84;

  return sign ? -sample : sample;
}

function pcm16ToMuLawByte(sample: number): number {
  const bias = 0x84;
  const clip = 32635;
  let sign = 0;
  let pcm = sample;

  if (pcm < 0) {
    pcm = -pcm;
    sign = 0x80;
  }

  pcm = Math.min(pcm, clip) + bias;

  let exponent = 7;
  for (let mask = 0x4000; (pcm & mask) === 0 && exponent > 0; mask >>= 1) {
    exponent -= 1;
  }

  const mantissa = (pcm >> (exponent + 3)) & 0x0f;

  return ~(sign | (exponent << 4) | mantissa) & 0xff;
}

function twilioMuLawToPcm16(muLawAudio: Buffer): Buffer {
  const pcmAudio = Buffer.alloc(muLawAudio.length * 2);

  for (let index = 0; index < muLawAudio.length; index += 1) {
    pcmAudio.writeInt16LE(muLawByteToPcm16(muLawAudio[index]), index * 2);
  }

  return pcmAudio;
}

function pcm16ToTwilioMuLaw(pcmAudio: Buffer): Buffer {
  const muLawAudio = Buffer.alloc(Math.floor(pcmAudio.length / 2));

  for (let index = 0; index < muLawAudio.length; index += 1) {
    muLawAudio[index] = pcm16ToMuLawByte(pcmAudio.readInt16LE(index * 2));
  }

  return muLawAudio;
}

function createPcmWav(pcmAudio: Buffer, sampleRate = AUDIO_SAMPLE_RATE): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * 2;
  const blockAlign = 2;

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmAudio.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmAudio.length, 40);

  return Buffer.concat([header, pcmAudio]);
}

function readWavData(wavAudio: Buffer): {
  audioFormat: number;
  bitsPerSample: number;
  channels: number;
  data: Buffer;
} | null {
  if (
    wavAudio.length < 44 ||
    wavAudio.toString('ascii', 0, 4) !== 'RIFF' ||
    wavAudio.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    return null;
  }

  let offset = 12;
  let audioFormat = 0;
  let bitsPerSample = 0;
  let channels = 0;
  let data: Buffer | null = null;

  while (offset + 8 <= wavAudio.length) {
    const chunkId = wavAudio.toString('ascii', offset, offset + 4);
    const chunkSize = wavAudio.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;

    if (chunkId === 'fmt ') {
      audioFormat = wavAudio.readUInt16LE(chunkStart);
      channels = wavAudio.readUInt16LE(chunkStart + 2);
      bitsPerSample = wavAudio.readUInt16LE(chunkStart + 14);
    }

    if (chunkId === 'data') {
      data = wavAudio.subarray(chunkStart, chunkStart + chunkSize);
      break;
    }

    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  if (!data || !audioFormat || !bitsPerSample || !channels) {
    return null;
  }

  return { audioFormat, bitsPerSample, channels, data };
}

function wavToTwilioMuLaw(wavAudio: Buffer): Buffer | null {
  const wav = readWavData(wavAudio);

  if (!wav) {
    return null;
  }

  if (wav.audioFormat === 7 && wav.bitsPerSample === 8) {
    return wav.data;
  }

  if (wav.audioFormat !== 1 || wav.bitsPerSample !== 16) {
    return null;
  }

  if (wav.channels === 1) {
    return pcm16ToTwilioMuLaw(wav.data);
  }

  const monoPcm = Buffer.alloc(Math.floor(wav.data.length / (2 * wav.channels)) * 2);

  for (let frame = 0; frame < monoPcm.length / 2; frame += 1) {
    monoPcm.writeInt16LE(wav.data.readInt16LE(frame * wav.channels * 2), frame * 2);
  }

  return pcm16ToTwilioMuLaw(monoPcm);
}

function stripDataUri(audio: string): { mediaType?: string; base64: string } {
  const match = audio.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    return { base64: audio };
  }

  return { mediaType: match[1], base64: match[2] };
}

function getAiResponseAudio(responseData: any): {
  audio?: string;
  format?: string;
} {
  if (typeof responseData === 'string') {
    return { audio: responseData };
  }

  const audio =
    responseData?.audio ||
    responseData?.audioBase64 ||
    responseData?.payload ||
    responseData?.media?.payload;

  const format =
    responseData?.mimeType ||
    responseData?.format ||
    responseData?.media?.mimeType ||
    responseData?.media?.format;

  return { audio, format };
}

function parseAiAudioResponse(responseData: Buffer, contentType = ''): {
  audio?: string;
  format?: string;
} {
  const normalizedContentType = contentType.split(';')[0].trim().toLowerCase();

  if (normalizedContentType.startsWith('audio/')) {
    return {
      audio: responseData.toString('base64'),
      format: normalizedContentType,
    };
  }

  const responseText = responseData.toString('utf8').trim();

  if (!responseText) {
    return {};
  }

  if (
    normalizedContentType === 'application/json' ||
    responseText.startsWith('{') ||
    responseText.startsWith('[') ||
    responseText.startsWith('"')
  ) {
    try {
      return getAiResponseAudio(JSON.parse(responseText));
    } catch {
      return { audio: responseText };
    }
  }

  return { audio: responseText };
}

export function setupCallAiStreamBridge(server: Server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const requestUrl = new URL(request.url || '', 'http://localhost');

    if (requestUrl.pathname !== STREAM_PATH) {
      return;
    }

    const streamToken = process.env.TWILIO_STREAM_AUTH_TOKEN;

    if (streamToken && requestUrl.searchParams.get('token') !== streamToken) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (twilioWs) => {
    let streamSid = '';
    let callSid = '';
    let audioBuffer: Buffer[] = [];
    let bufferedAudioBytes = 0;
    let flushTimer: NodeJS.Timeout | null = null;
    let isFlushing = false;
    let isClosed = false;
    let initialMessage = '';
    let initialMessageSent = false;

    const sendAudioToTwilio = (audio: string, format?: string) => {
      if (!streamSid || !audio || twilioWs.readyState !== WebSocket.OPEN) {
        return;
      }

      const normalizedAudio = stripDataUri(audio);
      const responseFormat = normalizedAudio.mediaType || format || 'audio/x-mulaw';
      let twilioAudio = normalizedAudio.base64;

      if (responseFormat === 'audio/wav' || responseFormat === 'audio/x-wav') {
        const convertedAudio = wavToTwilioMuLaw(Buffer.from(twilioAudio, 'base64'));

        if (!convertedAudio) {
          console.error('AI returned an unsupported WAV format');
          return;
        }

        twilioAudio = convertedAudio.toString('base64');
      } else if (responseFormat === 'audio/mpeg' || responseFormat === 'audio/mp3') {
        console.error('AI returned MP3 audio, but Twilio playback requires mu-law or WAV');
        return;
      }

      twilioWs.send(
        JSON.stringify({
          event: 'media',
          streamSid,
          media: {
            payload: twilioAudio,
          },
        }),
      );

      twilioWs.send(
        JSON.stringify({
          event: 'mark',
          streamSid,
          mark: {
            name: `ai-response-${Date.now()}`,
          },
        }),
      );
    };

    const requestInitialAiAudio = async (quoteData: string, sessionId: string) => {
      const body = new URLSearchParams();
      body.set('quote_data', quoteData);
      body.set('session_id', sessionId);

      const response = await axios.post(AI_CHATBOT_INITIAL_URL, body, {
        timeout: 30000,
        responseType: 'arraybuffer',
        transformResponse: [(data) => data],
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-voice-session-id': sessionId,
        },
      });

      return parseAiAudioResponse(
        Buffer.from(response.data),
        response.headers['content-type'],
      );
    };

    const requestAiAudio = async (wavAudio: Buffer, sessionId: string) => {
      const body = new FormData();
      const audioArrayBuffer = new ArrayBuffer(wavAudio.byteLength);
      new Uint8Array(audioArrayBuffer).set(wavAudio);
      body.set('session_id', sessionId);
      body.set('audio', new Blob([audioArrayBuffer], { type: 'audio/wav' }), 'user-audio.wav');

      const response = await axios.post(AI_CHATBOT_URL, body, {
        timeout: 30000,
        responseType: 'arraybuffer',
        transformResponse: [(data) => data],
        headers: {
          'x-voice-session-id': sessionId,
        },
      });

      return parseAiAudioResponse(
        Buffer.from(response.data),
        response.headers['content-type'],
      );
    };

    const playInitialAiMessage = async () => {
      if (!initialMessage || initialMessageSent || !streamSid || isClosed) {
        return;
      }

      initialMessageSent = true;

      try {
        const sessionId = callSid || streamSid;
        const responseAudio = await requestInitialAiAudio(initialMessage, sessionId);

        if (responseAudio.audio) {
          sendAudioToTwilio(responseAudio.audio, responseAudio.format || 'audio/wav');
        }
      } catch (error) {
        console.error('AI initial voice request failed:', error);
      }
    };

    const flushAudioToAi = async () => {
      if (isFlushing || !audioBuffer.length || !streamSid || isClosed) {
        return;
      }

      isFlushing = true;
      const twilioAudio = Buffer.concat(audioBuffer, bufferedAudioBytes);
      const pcmAudio = twilioMuLawToPcm16(twilioAudio);
      const wavAudio = createPcmWav(pcmAudio);
      audioBuffer = [];
      bufferedAudioBytes = 0;

      if (AI_AUDIO_FORMAT !== 'wav') {
        console.error(`Unsupported AI_CHATBOT_AUDIO_FORMAT: ${AI_AUDIO_FORMAT}`);
        isFlushing = false;
        return;
      }

      try {
        const sessionId = callSid || streamSid;
        const responseAudio = await requestAiAudio(wavAudio, sessionId);

        if (responseAudio.audio) {
          sendAudioToTwilio(responseAudio.audio, responseAudio.format || 'audio/wav');
        }
      } catch (error) {
        console.error('AI voice bridge request failed:', error);
      } finally {
        isFlushing = false;

        if (audioBuffer.length && !isClosed) {
          scheduleFlush(0);
        }
      }
    };

    const scheduleFlush = (delayMs = AUDIO_FLUSH_MS) => {
      if (flushTimer) {
        return;
      }

      flushTimer = setTimeout(() => {
        flushTimer = null;
        void flushAudioToAi();
      }, delayMs);
    };

    twilioWs.on('message', (rawMessage) => {
      let message: TwilioStreamMessage;

      try {
        message = JSON.parse(rawMessage.toString());
      } catch {
        return;
      }

      if (message.event === 'start') {
        streamSid = message.start?.streamSid || message.streamSid || '';
        callSid = message.start?.callSid || '';
        initialMessage = message.start?.customParameters?.initialMessage || '';
        void playInitialAiMessage();
        return;
      }

      if (message.event === 'media' && message.media?.payload) {
        const audioChunk = Buffer.from(message.media.payload, 'base64');

        if (!audioChunk.length) {
          return;
        }

        audioBuffer.push(audioChunk);
        bufferedAudioBytes += audioChunk.length;

        if (bufferedAudioBytes >= MAX_BUFFERED_AUDIO_BYTES) {
          twilioWs.close(1009, 'Audio buffer limit exceeded');
          return;
        }

        scheduleFlush();
        return;
      }

      if (message.event === 'stop') {
        if (flushTimer) {
          clearTimeout(flushTimer);
          flushTimer = null;
        }
        void flushAudioToAi();
      }
    });

    twilioWs.on('close', () => {
      isClosed = true;
      if (flushTimer) {
        clearTimeout(flushTimer);
      }
      audioBuffer = [];
      bufferedAudioBytes = 0;
    });

    twilioWs.on('error', (error) => {
      console.error('Twilio media stream socket error:', error);
    });
  });
}
