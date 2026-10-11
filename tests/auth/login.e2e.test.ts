import request from 'supertest';
import { App } from 'supertest/types';

import { HttpStatus, INestApplication } from '@nestjs/common';

import { clearDb } from '../utils/z.setup/clear-db';
import { getTestApp } from '../utils/z.setup/get-test-app.utils';
import { generateBasicAuthToken } from '../utils/generate-admin-auth-token';
import { getUserInputDto } from '../utils/users/get-user-input-dto';

import { PATHS } from '../../src/core/paths/paths';


describe('Login user (e2e)', () => {
  let app: INestApplication<App>;
  const adminToken = generateBasicAuthToken();

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await clearDb(app);
  });

  it('❌ should return 400 with invalid input', async () => {
    const response = await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/login`)
      .send({
        loginOrEmail: '',
        password: '',
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errorsMessages).toHaveLength(2);

    const fields = response.body.errorsMessages.map(
      (error: { field: string }) => error.field,
    );

    expect(fields).toContain('loginOrEmail');
    expect(fields).toContain('password');
  });

  it('❌ should return 401 with incorrect password', async () => {
    const inputData = await getUserInputDto();

    await request(app.getHttpServer())
      .post(PATHS.USERS)
      .set('Authorization', adminToken)
      .send(inputData)
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/login`)
      .send({
        loginOrEmail: inputData.login,
        password: 'wrong-password',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('✅ should login with correct credentials using login', async () => {
    const inputData = await getUserInputDto();

    await request(app.getHttpServer())
      .post(PATHS.USERS)
      .set('Authorization', adminToken)
      .send(inputData)
      .expect(HttpStatus.CREATED);

    const response = await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/login`)
      .send({
        loginOrEmail: inputData.login,
        password: inputData.password,
      })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });

    expect(response.body.accessToken.length).toBeGreaterThan(0);
  });

  it('✅ should login with correct credentials using email', async () => {
    const inputData = await getUserInputDto();

    await request(app.getHttpServer())
      .post(PATHS.USERS)
      .set('Authorization', adminToken)
      .send(inputData)
      .expect(HttpStatus.CREATED);

    const response = await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/login`)
      .send({
        loginOrEmail: inputData.email,
        password: inputData.password,
      })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });

    expect(response.body.accessToken.length).toBeGreaterThan(0);
  });

});