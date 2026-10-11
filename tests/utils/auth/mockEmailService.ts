import { INestApplication } from '@nestjs/common';
import { EmailService } from 'src/modules/notifications/email.service';

export const mockEmailService = (app: INestApplication) => {
  
  const emailService = app.get(EmailService);

  let confirmationCode: string | undefined;
  let recoveryCode: string | undefined;

  jest.spyOn(emailService, 'sendEmail')
    .mockImplementation(async (_email, _subject, html) => {
      const confirmMatch =
        html.match(/confirm-email\?code=([a-zA-Z0-9-]+)/);

      if (confirmMatch) {
        confirmationCode = confirmMatch[1];
      }

      const recoveryMatch =
        html.match(/password-recovery\?recoveryCode=([a-zA-Z0-9-]+)/);

      if (recoveryMatch) {
        recoveryCode = recoveryMatch[1];
      }

      return true;
    });

  return {
    getConfirmationCode: () => confirmationCode,
    getRecoveryCode: () => recoveryCode,
  };
};