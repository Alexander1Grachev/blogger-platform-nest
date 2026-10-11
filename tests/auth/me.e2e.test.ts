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
import { createUserUtil } from '../utils/users/create-user.util';

describe('READ me info', () => {
  let app: INestApplication<App>;
  let emailMock: ReturnType<typeof mockEmailService>;
  let userModel: Model<UserDocument>; beforeAll(async () => {
  });

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

  it('❌ should return 401 with wrong accessToken', async () => {
    await request(app.getHttpServer())
      .get(`${PATHS.AUTH}/me`)
      .set('Authorization', 'Bearer wrong.token.value')
      .expect(HttpStatus.UNAUTHORIZED)
  });

  it('❌ should return 401 without accessToken', async () => {
    await request(app.getHttpServer())
      .get(`${PATHS.AUTH}/me`)
      .expect(HttpStatus.UNAUTHORIZED)
  });

  it('✅ should return me info', async () => {
    const userDto = {
      login: 'test',
      password: '123456',
      email: 'test@mail.com',
    }

    const { login } = await createUserUtil(app, userDto)

    const loginRes = await request(app.getHttpServer())
      .post(`${PATHS.AUTH}/login`)
      .send({ loginOrEmail: login, password: userDto.password })
      .expect(HttpStatus.OK);

    const { accessToken } = loginRes.body;
    if (!accessToken) {
      throw new Error('Login did not return accessToken');
    }
    
    const res = await request(app.getHttpServer())
      .get(`${PATHS.AUTH}/me`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)

    expect(res.body).toEqual({
      email: 'test@mail.com',
      login: 'test',
      userId: expect.any(String),
    })
  });
})