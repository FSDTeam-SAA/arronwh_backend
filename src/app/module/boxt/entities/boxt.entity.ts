import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BoxtDocument = HydratedDocument<Boxt>;

@Schema({ timestamps: true })
export class Boxt {}

export const BoxtSchema = SchemaFactory.createForClass(Boxt);
