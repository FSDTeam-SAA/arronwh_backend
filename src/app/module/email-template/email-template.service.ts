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
import { fileUpload } from 'src/app/helpers/fileUploder';

export type RenderEmailTemplateOptions = {
  key: string;
  fallbackSubject: string;
  fallbackHtml: string;
  context?: Record<string, unknown>;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeTemplateTokens = (template: string) =>
  template
    .replace(/%7B/gi, '{')
    .replace(/%7D/gi, '}')
    .replace(/&#123;|&#x7b;|&lbrace;|&lcub;/gi, '{')
    .replace(/&#125;|&#x7d;|&rbrace;|&rcub;/gi, '}');

const imageAttributePattern =
  /(\b(?:src|poster|data-src)\s*=\s*)(["'])(.*?)\2/gi;

const imageUrlPattern = /url\((['"]?)(.*?)\1\)/gi;

const isTextObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

@Injectable()
export class EmailTemplateService implements OnModuleInit {
  private defaultTemplatesSeedPromise: Promise<void> | null = null;

  constructor(
    @InjectModel(EmailTemplate.name)
    private readonly emailTemplateModel: Model<EmailTemplateDocument>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultTemplates();
  }

  async ensureDefaultTemplates() {
    if (this.defaultTemplatesSeedPromise) {
      return this.defaultTemplatesSeedPromise;
    }

    this.defaultTemplatesSeedPromise = this.seedDefaultTemplates().finally(
      () => {
        this.defaultTemplatesSeedPromise = null;
      },
    );

    return this.defaultTemplatesSeedPromise;
  }

  private async seedDefaultTemplates() {
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

    let updatedHtml = payload.html ?? template.html;
    let updatedProject =
      payload.grapesJsProject !== undefined
        ? payload.grapesJsProject
        : template.grapesJsProject;

    if (payload.subject !== undefined) {
      template.subject = payload.subject;
    }

    const normalized = await this.normalizeTemplateMedia({
      html: updatedHtml,
      grapesJsProject: updatedProject,
    });

    updatedHtml = normalized.html;
    updatedProject = normalized.grapesJsProject;

    template.html = updatedHtml;

    if (payload.grapesJsProject !== undefined || template.grapesJsProject) {
      template.grapesJsProject = updatedProject;
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
    const normalizedTemplate = normalizeTemplateTokens(template);
    const withRawTokens = normalizedTemplate.replace(
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
    await this.emailTemplateModel.updateOne(
      { key: definition.key },
      {
        $set: {
          name: definition.name,
          description: definition.description,
          defaultSubject: definition.defaultSubject,
          defaultHtml: definition.defaultHtml,
          variables: definition.variables,
        },
        $setOnInsert: {
          key: definition.key,
          subject: definition.defaultSubject,
          html: definition.defaultHtml,
          isCustomized: false,
          grapesJsProject: null,
        },
      },
      { upsert: true },
    );

    await this.emailTemplateModel.updateOne(
      { key: definition.key, isCustomized: false },
      {
        $set: {
          subject: definition.defaultSubject,
          html: definition.defaultHtml,
        },
      },
    );
  }

  private async normalizeTemplateMedia({
    html,
    grapesJsProject,
  }: {
    html: string;
    grapesJsProject?: Record<string, unknown> | null;
  }) {
    const htmlSourceMap = new Map<string, Promise<string>>();
    const normalizedHtml = await this.normalizeHtmlMedia(html, htmlSourceMap);
    const normalizedProject = await this.normalizeProjectMedia(
      grapesJsProject,
      htmlSourceMap,
    );

    return {
      html: normalizedHtml,
      grapesJsProject: normalizedProject,
    };
  }

  private async normalizeHtmlMedia(
    html: string,
    sourceMap: Map<string, Promise<string>>,
  ) {
    if (!html) return html;

    imageAttributePattern.lastIndex = 0;
    imageUrlPattern.lastIndex = 0;
    const sources = new Set<string>();

    for (const match of html.matchAll(imageAttributePattern)) {
      const source = match[3]?.trim();
      if (source) {
        sources.add(source);
      }
    }

    for (const match of html.matchAll(imageUrlPattern)) {
      const source = match[2]?.trim();
      if (source) {
        sources.add(source);
      }
    }

    const replacements = new Map<string, string>();

    for (const source of sources) {
      const uploadedSource = await this.resolveTemplateImageSource(
        source,
        sourceMap,
      );

      replacements.set(source, uploadedSource);
    }

    const normalizedHtml = html.replace(
      imageAttributePattern,
      (match, prefix: string, quote: string, source: string) => {
        const trimmedSource = source.trim();
        const uploadedSource = replacements.get(trimmedSource);

        if (!uploadedSource) return match;

        return `${prefix}${quote}${uploadedSource}${quote}`;
      },
    );

    return normalizedHtml.replace(
      imageUrlPattern,
      (match, quote: string, source: string) => {
        const trimmedSource = source.trim();
        const uploadedSource = replacements.get(trimmedSource);

        if (!uploadedSource) return match;

        return `url("${uploadedSource}")`;
      },
    );
  }

  private async normalizeProjectMedia(
    project: Record<string, unknown> | null | undefined,
    sourceMap: Map<string, Promise<string>>,
  ) {
    if (!project) {
      return project ?? null;
    }

    const entries = await Promise.all(
      Object.entries(project).map(async ([key, value]) => {
        return [key, await this.normalizeProjectValue(key, value, sourceMap)];
      }),
    );

    return Object.fromEntries(entries);
  }

  private async normalizeProjectValue(
    key: string,
    value: unknown,
    sourceMap: Map<string, Promise<string>>,
  ): Promise<unknown> {
    if (Array.isArray(value)) {
      return Promise.all(
        value.map((entry) => this.normalizeProjectValue(key, entry, sourceMap)),
      );
    }

    if (isTextObject(value)) {
      const entries = await Promise.all(
        Object.entries(value).map(async ([nestedKey, nestedValue]) => {
          return [
            nestedKey,
            await this.normalizeProjectValue(nestedKey, nestedValue, sourceMap),
          ];
        }),
      );

      return Object.fromEntries(entries);
    }

    if (typeof value === 'string') {
      const normalizedKey = key.toLowerCase();

      if (
        normalizedKey.includes('src') ||
        normalizedKey.includes('poster') ||
        normalizedKey === 'assets' ||
        normalizedKey === 'image' ||
        normalizedKey === 'images'
      ) {
        return this.resolveTemplateImageSource(value, sourceMap);
      }

      if (normalizedKey.includes('style') || value.includes('url(')) {
        return this.normalizeInlineCssMedia(value, sourceMap);
      }
    }

    return value;
  }

  private async normalizeInlineCssMedia(
    value: string,
    sourceMap: Map<string, Promise<string>>,
  ) {
    if (!value || !value.includes('url(')) {
      return value;
    }

    imageUrlPattern.lastIndex = 0;
    const sources = new Set<string>();

    for (const match of value.matchAll(imageUrlPattern)) {
      const source = match[2]?.trim();
      if (source) {
        sources.add(source);
      }
    }

    const replacements = new Map<string, string>();

    for (const source of sources) {
      const uploadedSource = await this.resolveTemplateImageSource(
        source,
        sourceMap,
      );

      replacements.set(source, uploadedSource);
    }

    return value.replace(
      imageUrlPattern,
      (match, quote: string, source: string) => {
        const trimmedSource = source.trim();
        const uploadedSource = replacements.get(trimmedSource);

        if (!uploadedSource) return match;

        return `url("${uploadedSource}")`;
      },
    );
  }

  private async resolveTemplateImageSource(
    source: string,
    sourceMap: Map<string, Promise<string>>,
  ): Promise<string> {
    const normalizedSource = source?.trim();

    if (!normalizedSource) {
      return normalizedSource;
    }

    if (sourceMap.has(normalizedSource)) {
      return sourceMap.get(normalizedSource) ?? normalizedSource;
    }

    const uploadPromise = fileUpload.uploadImageSourceToCloudinary(
      normalizedSource,
    );
    sourceMap.set(normalizedSource, uploadPromise);

    return uploadPromise;
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
