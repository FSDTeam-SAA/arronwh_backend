import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class MakeCallDto {
  @ApiProperty({
    example: '+447700900123',
    description: 'Recipient phone number in international format',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  to: string;

  @ApiProperty({
    example: 'Hello, this is a confirmation call from YOLO HEAT.',
    description: 'Opening text Twilio will read before connecting the AI call',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @ApiProperty({
    example: 'https://api.example.com/call/status',
    description: 'Optional public webhook URL for Twilio call status updates',
    required: false,
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  statusCallbackUrl?: string;

  @ApiPropertyOptional({
    example: 'https://api.example.com/call/recording',
    description: 'Legacy recording callback URL. AI calls do not require this.',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  recordingCallbackUrl?: string;
}

export class CallStatusCallbackDto {
  @ApiProperty({
    example: 'CA2bbe61f53fc5d3258b17b78b790397b4',
    description: 'Twilio call SID',
  })
  @IsString()
  @IsNotEmpty()
  CallSid: string;

  @ApiProperty({
    example: 'completed',
    description: 'Current call status sent by Twilio',
  })
  @IsString()
  @IsNotEmpty()
  CallStatus: string;

  @ApiPropertyOptional({
    example: '+447841625618',
    description: 'Recipient phone number',
  })
  @IsOptional()
  @IsString()
  To?: string;

  @ApiPropertyOptional({
    example: '+15017122661',
    description: 'Twilio sender phone number',
  })
  @IsOptional()
  @IsString()
  From?: string;

  @ApiPropertyOptional({
    example: '42',
    description: 'Call duration in seconds when available',
  })
  @IsOptional()
  @IsString()
  CallDuration?: string;
}

export class CallRecordingCallbackDto {
  @ApiProperty({
    example: 'CA2bbe61f53fc5d3258b17b78b790397b4',
    description: 'Twilio call SID',
  })
  @IsString()
  @IsNotEmpty()
  CallSid: string;

  @ApiProperty({
    example: 'RE557ce644e5ab84fa21cc21112e22c485',
    description: 'Twilio recording SID',
  })
  @IsOptional()
  @IsString()
  RecordingSid?: string;

  @ApiProperty({
    example: 'https://api.twilio.com/2010-04-01/Accounts/ACxxx/Recordings/RExxx',
    description: 'Twilio recording URL',
  })
  @IsOptional()
  @IsString()
  RecordingUrl?: string;

  @ApiPropertyOptional({
    example: '7',
    description: 'Recording duration in seconds',
  })
  @IsOptional()
  @IsString()
  RecordingDuration?: string;

  @ApiPropertyOptional({
    example: 'completed',
    description: 'Recording status from Twilio',
  })
  @IsOptional()
  @IsString()
  RecordingStatus?: string;

  @ApiPropertyOptional({
    example: '12300',
    description: 'Twilio recording error code when recording status is absent',
  })
  @IsOptional()
  @IsString()
  ErrorCode?: string;
}

export class IncomingCallWebhookDto {
  @ApiPropertyOptional({
    example: 'CA2bbe61f53fc5d3258b17b78b790397b4',
    description: 'Twilio call SID',
  })
  @IsOptional()
  @IsString()
  CallSid?: string;

  @ApiPropertyOptional({
    example: '+441615196015',
    description: 'Caller phone number',
  })
  @IsOptional()
  @IsString()
  From?: string;

  @ApiPropertyOptional({
    example: '+447841625618',
    description: 'Twilio receiver phone number',
  })
  @IsOptional()
  @IsString()
  To?: string;

  @ApiPropertyOptional({
    example: 'ringing',
    description: 'Incoming call status from Twilio',
  })
  @IsOptional()
  @IsString()
  CallStatus?: string;

  @ApiPropertyOptional({
    example: 'Hello, you are connected with YOLO HEAT. How can I help you today?',
    description: 'Optional opening text Twilio will read before streaming',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
