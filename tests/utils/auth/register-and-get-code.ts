
import request from 'supertest';
import { App } from 'supertest/types';

import { HttpStatus, INestApplication } from '@nestjs/common';
import { PATHS } from 'src/core/paths/paths';
import { getUserInputDto } from '../users/get-user-input-dto';
import { mockEmailService } from './mockEmailService';
import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/users.input-dto';

export async function registerAndGetCode(
  app: INestApplication<App>,
  emailMock: ReturnType<typeof mockEmailService>,
  overrides?: Partial<CreateUserInputDto>,
): Promise<string> {


  await request(app.getHttpServer())
    .post(`${PATHS.AUTH}/registration`)
    .send(getUserInputDto(overrides))
    .expect(HttpStatus.NO_CONTENT);

  const code = emailMock.getConfirmationCode();
  expect(code).toBeDefined();
  return code!;
}
