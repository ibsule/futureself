import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import { ISendEmail } from './interfaces/send-email.interface';
import { ConfigService } from '@nestjs/config';
import { HttpRequestsUtil } from 'src/utils/http.util';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly configService = new ConfigService<IENV, true>();
  private readonly SENDER_NAME = this.configService.get('EMAIL_SENDER_NAME', {
    infer: true,
  });
  private readonly SENDER_EMAIL = this.configService.get('EMAIL_SENDER_EMAIL', {
    infer: true,
  });
  private readonly BREVO_API_ENDPOINT = this.configService.get(
    'BREVO_API_ENDPOINT',
    {
      infer: true,
    },
  );

  constructor(
    private readonly httpRequests: HttpRequestsUtil,
    // private readonly configService: ConfigService<IENV, true>,
  ) {}

  async send(data: ISendEmail) {
    try {
      const { email, emailData, subject, template, name } = data;

      const payload = {
        sender: {
          name: this.SENDER_NAME,
          email: this.SENDER_EMAIL,
        },
        to: [{ email, name }],
        subject,
        htmlContent: this.generateTemplateString(template, emailData),
      };

      const headers = {
        accept: 'application/json',
        'api-key': this.configService.get('BREVO_API_KEY', { infer: true }),
        'content-type': 'application/json',
      };

      const res = await this.httpRequests.postRequest({
        url: this.BREVO_API_ENDPOINT,
        payload,
        headers,
      });

      if (!res) {
        this.logger.error(`Failed to send mail to ${email}: ${res}`);
      }

      return res;
    } catch (error) {
      this.logger.error(error);
    }
  }

  private generateTemplateString(filename: string, data: any) {
    try {
      const cwd = process.cwd();
      const filepath = `${cwd}/templates/${filename}.hbs`;

      const templateFile = fs.readFileSync(filepath, 'utf8');

      const template = Handlebars.compile(templateFile, { noEscape: true });

      return template(data);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
