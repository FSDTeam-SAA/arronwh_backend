import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import {
  EmailTemplate,
  EmailTemplateDocument,
  EmailTemplateVariable,
} from './entities/email-template.entity';
import {
  EmailTemplateDefinition,
  getEmailTemplateDefinitions,
} from './email-template.defaults';
import { escapeHtml } from './email-template.context';

export type RenderEmailTemplateOptions = {
  key: string;
  fallbackSubject: string;
  fallbackHtml: string;
  context?: Record<string, unknown>;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class EmailTemplateService implements OnModuleInit {
  constructor(
    @InjectModel(EmailTemplate.name)
    private readonly emailTemplateModel: Model<EmailTemplateDocument>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultTemplates();
  }

  async ensureDefaultTemplates() {
    const definitions = getEmailTemplateDefinitions();

    for (const definition of definitions) {
      await this.upsertDefinition(definition);
    }
  }

  async findAll() {
    await this.ensureDefaultTemplates();

    return this.emailTemplateModel
      .find()
      .select('-html -defaultHtml -grapesJsProject')
      .sort({ name: 1 })
      .lean();
  }

  async findOne(key: string) {
    await this.ensureDefaultTemplates();
    const template = await this.emailTemplateModel.findOne({ key }).lean();

    if (!template) {
      throw new HttpException('Email template not found', 404);
    }

    return {
      ...template,
      missingVariables: this.getMissingVariables(
        template.subject,
        template.html,
        template.variables,
      ),
    };
  }

  async update(key: string, payload: UpdateEmailTemplateDto) {
    await this.ensureDefaultTemplates();
    const template = await this.emailTemplateModel.findOne({ key });

    if (!template) {
      throw new HttpException('Email template not found', 404);
    }

    if (payload.subject !== undefined) {
      template.subject = payload.subject;
    }

    if (payload.html !== undefined) {
      template.html = payload.html;
    }

    if (payload.grapesJsProject !== undefined) {
      template.grapesJsProject = payload.grapesJsProject;
    }

    template.isCustomized = true;
    await template.save();

    return {
      ...template.toObject(),
      missingVariables: this.getMissingVariables(
        template.subject,
        template.html,
        template.variables,
      ),
    };
  }

  async reset(key: string) {
    await this.ensureDefaultTemplates();
    const template = await this.emailTemplateModel.findOne({ key });

    if (!template) {
      throw new HttpException('Email template not found', 404);
    }

    template.subject = template.defaultSubject;
    template.html = template.defaultHtml;
    template.grapesJsProject = null;
    template.isCustomized = false;
    await template.save();

    return template;
  }

  async render({
    key,
    fallbackSubject,
    fallbackHtml,
    context = {},
  }: RenderEmailTemplateOptions) {
    const template = await this.emailTemplateModel.findOne({ key }).lean();

    if (!template?.isCustomized) {
      return {
        subject: fallbackSubject,
        html: fallbackHtml,
      };
    }

    return {
      subject: this.compile(template.subject || fallbackSubject, context),
      html: this.compile(template.html || fallbackHtml, context),
    };
  }

  compile(template: string, context: Record<string, unknown>) {
    const withRawTokens = template.replace(
      /{{{\s*([\w.-]+)\s*}}}/g,
      (_match, tokenKey: string) => this.resolveToken(context, tokenKey),
    );

    return withRawTokens.replace(
      /{{\s*([\w.-]+)\s*}}/g,
      (_match, tokenKey: string) =>
        escapeHtml(this.resolveToken(context, tokenKey)),
    );
  }

  private async upsertDefinition(definition: EmailTemplateDefinition) {
    const existing = await this.emailTemplateModel.findOne({
      key: definition.key,
    });

    if (!existing) {
      await this.emailTemplateModel.create({
        key: definition.key,
        name: definition.name,
        description: definition.description,
        subject: definition.defaultSubject,
        html: definition.defaultHtml,
        defaultSubject: definition.defaultSubject,
        defaultHtml: definition.defaultHtml,
        variables: definition.variables,
        isCustomized: false,
        grapesJsProject: null,
      });
      return;
    }

    existing.name = definition.name;
    existing.description = definition.description;
    existing.defaultSubject = definition.defaultSubject;
    existing.defaultHtml = definition.defaultHtml;
    existing.variables = definition.variables as EmailTemplateVariable[];

    if (!existing.isCustomized) {
      existing.subject = definition.defaultSubject;
      existing.html = definition.defaultHtml;
    }

    await existing.save();
  }

  private resolveToken(context: Record<string, unknown>, tokenKey: string) {
    if (Object.prototype.hasOwnProperty.call(context, tokenKey)) {
      const value = context[tokenKey];
      return value === null || value === undefined ? '' : String(value);
    }

    const value = tokenKey
      .split('.')
      .reduce<unknown>((current, segment) => {
        if (!current || typeof current !== 'object') return undefined;
        return (current as Record<string, unknown>)[segment];
      }, context);

    return value === null || value === undefined ? '' : String(value);
  }

  private getMissingVariables(
    subject: string,
    html: string,
    variables: EmailTemplateVariable[] = [],
  ) {
    const content = `${subject}\n${html}`;

    return variables
      .filter((variable) => variable.required)
      .filter((variable) => {
        const pattern = new RegExp(
          `{{{?\\s*${escapeRegExp(variable.key)}\\s*}?}}`,
        );
        return !pattern.test(content);
      })
      .map((variable) => variable.key);
  }
}
