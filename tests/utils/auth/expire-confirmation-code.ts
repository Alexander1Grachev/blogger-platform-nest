import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

import { User, UserModelType } from 'src/modules/user-accounts/domain/user.entity';

export async function expireConfirmationCode(
  app: INestApplication,
  code: string,
): Promise<void> {
  const userModel = app.get<UserModelType>(
    getModelToken(User.name),
  );

  await userModel.updateOne(
    {
      'emailConfirmation.confirmationCode': code,
    },
    {
      $set: {
        'emailConfirmation.expirationDate': new Date(
          Date.now() - 1000,
        ),
      },
    },
  );
}