import axios from 'axios';
import type { Server } from 'http';
import { URL } from 'url';

const WebSocket = require('ws');

const AI_CHATBOT_URL =
  process.env.AI_CHATBOT_URL || 'http://187.77.187.56:8002/api/voice/quote-follow-up';
const STREAM_PATH = '/api/v1/call/ai-stream';
const AUDIO_FLUSH_MS = 800;

type TwilioStreamMessage = {
  event: string;
  streamSid?: string;
  start?: {
    streamSid?: string;
    callSid?: string;
  };
  media?: {
    payload?: string;
  };
};

export function setupCallAiStreamBridge(server: Server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const requestUrl = new URL(request.url || '', 'http://localhost');

    if (requestUrl.pathname !== STREAM_PATH) {
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (twilioWs) => {
    let streamSid = '';
    let callSid = '';
    let audioBuffer: string[] = [];
    let flushTimer: NodeJS.Timeout | null = null;
    let isFlushing = false;

    const sendAudioToTwilio = (audio: string) => {
      if (!streamSid || !audio || twilioWs.readyState !== WebSocket.OPEN) {
        return;
      }

      twilioWs.send(
        JSON.stringify({
          event: 'media',
          streamSid,
          media: {
            payload: audio,
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

    const flushAudioToAi = async () => {
      if (isFlushing || !audioBuffer.length || !streamSid) {
        return;
      }

      isFlushing = true;
      const audio = audioBuffer.join('');
      audioBuffer = [];

      try {
        const response = await axios.post(
          AI_CHATBOT_URL,
          {
            callSid,
            streamSid,
            audio,
            format: 'audio/x-mulaw',
            sampleRate: 8000,
            encoding: 'base64',
          },
          {
            timeout: 30000,
          },
        );

        const responseAudio =
          response.data?.audio ||
          response.data?.payload ||
          response.data?.media?.payload;

        if (responseAudio) {
          sendAudioToTwilio(responseAudio);
        }
      } catch (error) {
        console.error('AI voice bridge request failed:', error);
      } finally {
        isFlushing = false;
      }
    };

    const scheduleFlush = () => {
      if (flushTimer) {
        return;
      }

      flushTimer = setTimeout(() => {
        flushTimer = null;
        void flushAudioToAi();
      }, AUDIO_FLUSH_MS);
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
        return;
      }

      if (message.event === 'media' && message.media?.payload) {
        audioBuffer.push(message.media.payload);
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
      if (flushTimer) {
        clearTimeout(flushTimer);
      }
      audioBuffer = [];
    });
  });
}
