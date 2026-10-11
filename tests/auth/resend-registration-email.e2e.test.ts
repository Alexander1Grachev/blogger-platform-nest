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

describe('POST /api/auth/registration-email-resending', () => {
  let app: INestApplication<App>;
  let emailMock: ReturnType<typeof mockEmailService>;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    app = await getTestApp();
    emailMock = mockEmailService(app);
    userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  })
  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await clearDb(app);
    resetThrottler(app);
  });

  it('❌ should return 400 if email not found', async () => {
    const response = await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration-email-resending`)
      .send({ email: 'notFound@example.com' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: 'email', // проверяем реальный field
        }),
      ])
    );
  });

  it('❌ should return 400 if user already confirmed', async () => {
    const code = await registerAndGetCode(
      app,
      emailMock,
      { email: 'example2@example.com' }
    );

    // подтверждаем пользователя первый раз
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration-confirmation`)
      .send({ code })
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration-email-resending`)
      .send({ email: 'example2@example.com' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: 'email', // поле ошибки реально email
        }),
      ])
    );
  });

  it('✅ should resend confirmation email if user not confirmed', async () => {
    const email = 'example@example.com';

    // создаём пользователя
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration`)
      .send({
        login: 'user3',
        password: 'correctPass1',
        email,
      })
      .expect(HttpStatus.NO_CONTENT);

    const firstCode = emailMock.getConfirmationCode();
    expect(firstCode).toBeDefined();

    // повторная отправка письма
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration-email-resending`)
      .send({ email })
      .expect(HttpStatus.NO_CONTENT);

    const secondCode = emailMock.getConfirmationCode();
    expect(firstCode).toBeDefined();
    expect(secondCode).not.toBe(firstCode); // новый код должен отличаться
  });

  it('❌ should return 429 after too many email-resending attempts', async () => {
    await registerAndGetCode(app, emailMock, { email: 'example2@example.com' });

    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post(`${PATHS.AUTH}/registration-email-resending`)
        .send({ email: 'example2@example.com' })
        .expect(HttpStatus.NO_CONTENT);
    }
    // 6-я попытка -- 429
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration-email-resending`)
      .send({ email: 'example2@example.com' })
      .expect(HttpStatus.TOO_MANY_REQUESTS);

  });
})