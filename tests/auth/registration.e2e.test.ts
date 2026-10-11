import request from 'supertest';
import { App } from 'supertest/types';

import { HttpStatus, INestApplication } from '@nestjs/common';

import { clearDb } from '../utils/z.setup/clear-db';
import { getTestApp } from '../utils/z.setup/get-test-app.utils';
import { getUserInputDto } from '../utils/users/get-user-input-dto';

import { PATHS } from '../../src/core/paths/paths';
import { mockEmailService } from '../utils/auth/mockEmailService';
import { resetThrottler } from '../utils/z.setup/reset-throttler.utils';


describe('POST /auth/registration', () => {

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

  it('❌ should return 429 after too many registration attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post(`${PATHS.AUTH}/registration`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    }
    // 6-я попытка -- 429
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration`)
      .send({})
      .expect(HttpStatus.TOO_MANY_REQUESTS);
  });

  it('❌ should return 400 if body is invalid', async () => {
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration`)
      .send({})
      .expect(HttpStatus.BAD_REQUEST);
  });


  it('❌ should return 400 if EMAIL already exists', async () => {
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration`)
      .send({
        ...getUserInputDto(),
        email: 'example@example.com'
      })
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration`)
      .send({
        ...getUserInputDto(),
        email: 'example@example.com'
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: 'email',
        }),
      ])
    );
  });


  it('❌ should return 400 if LOGIN already exists', async () => {
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration`)
      .send({
        ...getUserInputDto(),
        login: 'userLog3',

      })
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration`)
      .send({
        ...getUserInputDto(),
        login: 'userLog3',

      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
          field: 'login',
        }),
      ])
    );
  });



  it('✅ should register user and send confirmation email (204)', async () => {
    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/registration`)
      .send({
        ...getUserInputDto()
      })
      .expect(HttpStatus.NO_CONTENT);

    const confirmationCode = emailMock.getConfirmationCode();
    expect(confirmationCode).toBeDefined();
  });
})