import { Injectable } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { EMAIL_TEMPLATES } from './constants';

@Injectable()
export class AppService {
  constructor(private readonly emailService: EmailService) {}

  getServerStatus(): object {
    return {
      status: 'ok',
      current_time: new Date().toString(),
      message: 'server is running',
    };
  }

  async send() {
    await this.emailService.send({
      email: 'test@example.com',
      name: 'tester',
      subject: 'test test',
      template: EMAIL_TEMPLATES.TEST,
      emailData: {},
    });
  }
}
