import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type EmailTemplateDocument = HydratedDocument<EmailTemplate>;

export class EmailTemplateVariable {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  label: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: '' })
  sampleValue?: string;

  @Prop({ default: false })
  required?: boolean;
}

@Schema({ timestamps: true, collection: 'email_template_settings' })
export class EmailTemplate {
  @Prop({ required: true, unique: true, index: true })
  key: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  html: string;

  @Prop({ required: true })
  defaultSubject: string;

  @Prop({ required: true })
  defaultHtml: string;

  @Prop({
    type: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        description: { type: String, default: '' },
        sampleValue: { type: String, default: '' },
        required: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  variables: EmailTemplateVariable[];

  @Prop({ default: false })
  isCustomized: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  grapesJsProject?: Record<string, unknown> | null;
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
