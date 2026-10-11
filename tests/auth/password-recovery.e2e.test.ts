import request from 'supertest';
import { App } from 'supertest/types';

import { HttpStatus, INestApplication } from '@nestjs/common';

import { clearDb } from '../utils/z.setup/clear-db';
import { getTestApp } from '../utils/z.setup/get-test-app.utils';
import { resetThrottler } from '../utils/z.setup/reset-throttler.utils';
import { mockEmailService } from '../utils/auth/mockEmailService';

import { PATHS } from '../../src/core/paths/paths';
import { registerAndGetCode } from '../utils/auth/register-and-get-code';


describe('Password-recovery user (e2e)', () => {
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



  it('❌ should return 400 if  invalid email', async () => {
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/password-recovery`)
      .send({
        email: 'exampleexample.com'
      })
      .expect(HttpStatus.BAD_REQUEST)
  });

  it('✅ should send password recovery on email (Even if current email is not registered )', async () => {
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration`)
      .send({
        login: 'user3',
        password: 'correctPass1',
        email: 'example@example.com'
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/password-recovery`)
      .send({
        email: 'example@example.com'
      })
      .expect(HttpStatus.NO_CONTENT);

    const firstCode = emailMock.getRecoveryCode();
    expect(firstCode).toBeDefined();
  })

  it('❌ should return 429 after too many email-resending attempts', async () => {
  await registerAndGetCode(app, emailMock, { email: 'example2@example.com' });

    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post(`${PATHS.AUTH}/password-recovery`)
        .send({ email: 'example2@example.com' })
        .expect(HttpStatus.NO_CONTENT);
    }
    // 6-я попытка -- 429
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/password-recovery`)
      .send({ email: 'example2@example.com' })
      .expect(HttpStatus.TOO_MANY_REQUESTS);
  });
})