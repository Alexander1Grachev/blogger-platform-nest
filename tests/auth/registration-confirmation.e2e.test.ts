import request from 'supertest';
import { App } from 'supertest/types';

import { HttpStatus, INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { clearDb } from '../utils/z.setup/clear-db';
import { getTestApp } from '../utils/z.setup/get-test-app.utils';
import { resetThrottler } from '../utils/z.setup/reset-throttler.utils';
import { mockEmailService } from '../utils/auth/mockEmailService';

import { PATHS } from '../../src/core/paths/paths';
import {
  User,
  UserDocument,
} from '../../src/modules/user-accounts/domain/user.entity';
import { registerAndGetCode } from '../utils/auth/register-and-get-code';

describe('POST /auth/registration-confirmation', () => {
  let app: INestApplication<App>;
  let emailMock: ReturnType<typeof mockEmailService>;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    app = await getTestApp();
    emailMock = mockEmailService(app);
    userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await clearDb(app);
    resetThrottler(app);
  });


  it('❌ should return 400 if body is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration-confirmation`)
      .send({})
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: 'code',
        }),
      ]),
    );
  });

  it('❌ should return 400 if code expired', async () => {
    const code = await registerAndGetCode(app, emailMock);

    // промотали дату истечения кода в прошлое напрямую в базе
    await userModel.updateOne(
      { 'emailConfirmation.confirmationCode': code },
      { $set: { 'emailConfirmation.expirationDate': new Date(Date.now() - 1000) } },
    );

    const response = await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration-confirmation`)
      .send({ code })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: 'code',
        }),
      ]),
    );
  });

  it('❌ should return 400 if code already confirmed', async () => {
    const code = await registerAndGetCode(app, emailMock);

    // первый раз подтверждаем
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration-confirmation`)
      .send({ code })
      .expect(HttpStatus.NO_CONTENT);

    // повторная попытка тем же кодом
    const response = await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration-confirmation`)
      .send({ code })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: 'code',
        }),
      ]),
    );
  });

  it('✅ should confirm registration with valid code (204)', async () => {
    const code = await registerAndGetCode(app, emailMock);

    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration-confirmation`)
      .send({ code })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('❌ should return 429 after too many registration-confirmation attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post(`${PATHS.AUTH}/registration-confirmation`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    }

    // 6-я попытка — 429
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration-confirmation`)
      .send({})
      .expect(HttpStatus.TOO_MANY_REQUESTS);
  });
});