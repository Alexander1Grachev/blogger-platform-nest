import request from 'supertest';
import { App } from 'supertest/types';

import { HttpStatus, INestApplication } from '@nestjs/common';

import { clearDb } from '../utils/z.setup/clear-db';
import { getTestApp } from '../utils/z.setup/get-test-app.utils';
import { resetThrottler } from '../utils/z.setup/reset-throttler.utils';
import { mockEmailService } from '../utils/auth/mockEmailService';

import { PATHS } from '../../src/core/paths/paths';
import { registerAndGetRecoveryCode } from '../utils/auth/register-and-get-recovery-code';

describe('New password confirmation', () => {
  let app: INestApplication<App>;
  let emailMock: ReturnType<typeof mockEmailService>;

  beforeAll(async () => {
    app = await getTestApp();
    emailMock = mockEmailService(app);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await clearDb(app);
    resetThrottler(app);
  });


  // тестим middleware-валидатор
  it('❌ should return 400 if password is invalid', async () => {
    const { recoveryCode } = await registerAndGetRecoveryCode(app, emailMock);

    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/new-password`)
      .send({
        newPassword: '123',
        recoveryCode,
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('❌ should return 400 if recovery code is invalid', async () => {
    await registerAndGetRecoveryCode(app, emailMock);

    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/new-password`)
      .send({
        newPassword: 'ValidPass123',
        recoveryCode: 'wrong-recovery-code',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  // тестим бизнес-логику
  it('❌ should return 400 if recovery code already used', async () => {
    const { recoveryCode } = await registerAndGetRecoveryCode(app, emailMock);


    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/new-password`)
      .send({
        newPassword: 'NewPass00',
        recoveryCode,
      })
      .expect(HttpStatus.NO_CONTENT);

    // повторное использование того же кода — защита от повторного применения
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/new-password`)
      .send({
        newPassword: 'NewPass1',
        recoveryCode,
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('✅ should confirm password changes if code and new password are valid', async () => {
    const { recoveryCode, email } = await registerAndGetRecoveryCode(app, emailMock, {
      password: 'correctPass2',
    });
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/new-password`)
      .send({ newPassword: 'NewPass2', recoveryCode })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/login`)
      .send({ loginOrEmail: email, password: 'NewPass2' })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/login`)
      .send({ loginOrEmail: email, password: 'correctPass2' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('❌ should return 429 after too many attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post(`${PATHS.AUTH}/new-password`)
        .send({
          newPassword: '123456',
          recoveryCode: 'invalid-code',
        })
        .expect(HttpStatus.BAD_REQUEST);
    }

    // 6-я попытка — 429
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/new-password`)
      .send({
        newPassword: '123456',
        recoveryCode: 'invalid-code',
      })
      .expect(HttpStatus.TOO_MANY_REQUESTS);
  });
});