import { SUBJECT_EMAIL_MAP } from '@/common/constants';
import { EmailTemplateNameEnum } from '@/common/enums';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  public handleSendEmail = async (
    email: string,
    templateName: EmailTemplateNameEnum,
    context: Record<string, any>,
  ) => {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: SUBJECT_EMAIL_MAP[templateName],
        template: templateName,
        context,
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
}
