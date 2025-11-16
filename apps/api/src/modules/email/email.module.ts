import { EMAILS_QUEUE_NAME } from '@/common/constants';
import { EmailProcessor } from '@/modules/email/processors';
import { EmailProducer } from '@/modules/email/producers';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('mailer.host', ''),
          port: configService.get<number>('mailer.port', 587),
          secure: false,
          auth: {
            user: configService.get<string>('mailer.user', ''),
            pass: configService.get<string>('mailer.pass', ''),
          },
        },
        defaults: {
          from: 'BookStore Support <bookstoresupport@gmail.com>',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    BullModule.registerQueue({
      name: EMAILS_QUEUE_NAME,
    }),
  ],
  providers: [EmailService, EmailProcessor, EmailProducer],
  exports: [EmailService],
})
export class EmailModule {}
