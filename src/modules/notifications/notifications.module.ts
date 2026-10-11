


import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: configService.getOrThrow<string>('EMAIL'),
          pass: configService.getOrThrow<string>('EMAIL_PASS'),
        },
      },
    }),

  })

  ],
  providers: [EmailService],
  exports: [EmailService],
})

export class NotificationsModule { }