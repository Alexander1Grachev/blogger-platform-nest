import request from 'supertest';
import { App } from 'supertest/types';

import { HttpStatus, INestApplication } from '@nestjs/common';
import { PATHS } from 'src/core/paths/paths';
import { getUserInputDto } from '../users/get-user-input-dto';
import { mockEmailService } from './mockEmailService';
import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/users.input-dto';

export async function registerAndGetRecoveryCode(
  app: INestApplication<App>,
  emailMock: ReturnType<typeof mockEmailService>,
  overrides?: Partial<CreateUserInputDto>,
): Promise<{ recoveryCode: string; email: string }> {
  
  const dto = getUserInputDto(overrides);

  await request(app.getHttpServer())
    .post(`${PATHS.AUTH}/registration`)
    .send(dto)
    .expect(HttpStatus.NO_CONTENT);

  await request(app.getHttpServer())
    .post(`${PATHS.AUTH}/password-recovery`)
    .send({ email: dto.email })
    .expect(HttpStatus.NO_CONTENT);

  const recoveryCode = emailMock.getRecoveryCode();
  expect(recoveryCode).toBeDefined();

  return { recoveryCode: recoveryCode!, email: dto.email };
}