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
    description: 'Text Twilio will read during the call',
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

  @ApiProperty({
    example: 'https://api.example.com/call/recording',
    description: 'Public webhook URL where Twilio sends the recorded voice answer',
  })
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  recordingCallbackUrl: string;
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
  @IsString()
  @IsNotEmpty()
  RecordingSid: string;

  @ApiProperty({
    example: 'https://api.twilio.com/2010-04-01/Accounts/ACxxx/Recordings/RExxx',
    description: 'Twilio recording URL',
  })
  @IsString()
  @IsNotEmpty()
  RecordingUrl: string;

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
}
