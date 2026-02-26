import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendEmail(email: string, login: string, password: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Tizimga kirish uchun login/password',
      template: 'index',
      context: {
        login,
        password,
      },
    });
  }
}
