import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PATHS } from 'src/core/paths/paths';
import { App } from 'supertest/types';
import { clearDb } from '../utils/z.setup/clear-db';
import { getTestApp } from '../utils/z.setup/get-test-app.utils';
import { generateBasicAuthToken } from '../utils/generate-admin-auth-token';
import { getUserInputDto } from '../utils/users/get-user-input-dto';
import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/users.input-dto';


describe('Users (e2e)', () => {
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

  describe('GET /users', () => {
    it('❌ should not return users without auth', async () => {
      await request(app.getHttpServer())
        .get(PATHS.USERS)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('❌ should not return users with wrong auth', async () => {
      const wrongToken =
        'Basic ' + Buffer.from('wrong:creds').toString('base64');

      await request(app.getHttpServer())
        .get(PATHS.USERS)
        .set('Authorization', wrongToken)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('✅ should return empty list for authorized request', async () => {
      const response = await request(app.getHttpServer())
        .get(PATHS.USERS)
        .set('Authorization', adminToken)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
  });

  describe('POST /users', () => {
    it('❌ should not create user without auth', async () => {
      const inputData = await getUserInputDto();

      await request(app.getHttpServer())
        .post(PATHS.USERS)
        .send(inputData)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('❌ should not create user with wrong auth', async () => {
      const inputData = await getUserInputDto();

      const wrongToken =
        'Basic ' + Buffer.from('wrong:creds').toString('base64');

      await request(app.getHttpServer())
        .post(PATHS.USERS)
        .set('Authorization', wrongToken)
        .send(inputData)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('❌ should not create user with invalid attributes', async () => {
      const invalidTestUserAttributes: CreateUserInputDto = {
        login: '   ',
        password: 'a'.repeat(600),
        email: 'new1usermail.com',
      };

      const invalidResponse = await request(app.getHttpServer())
        .post(PATHS.USERS)
        .set('Authorization', adminToken)
        .send(invalidTestUserAttributes)
        .expect(HttpStatus.BAD_REQUEST);

      expect(invalidResponse.body.errorsMessages).toHaveLength(3);

      const userList = await request(app.getHttpServer())
        .get(PATHS.USERS)
        .set('Authorization', adminToken)
        .expect(HttpStatus.OK);

      expect(userList.body.items).toHaveLength(0);
      expect(userList.body.totalCount).toBe(0);
    });

    it('❌ should not create user with same attributes', async () => {
      const inputData = await getUserInputDto();

      await request(app.getHttpServer())
        .post(PATHS.USERS)
        .set('Authorization', adminToken)
        .send(inputData)
        .expect(HttpStatus.CREATED);

      const secondResponse = await request(app.getHttpServer())
        .post(PATHS.USERS)
        .set('Authorization', adminToken)
        .send(inputData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(secondResponse.body.errorsMessages[0].field).toBe('login');

      const response = await request(app.getHttpServer())
        .get(PATHS.USERS)
        .set('Authorization', adminToken)
        .expect(HttpStatus.OK);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.totalCount).toBe(1);
    });

    it('✅ should create user with correct input data', async () => {
      const inputData = await getUserInputDto();

      const response = await request(app.getHttpServer())
        .post(PATHS.USERS)
        .set('Authorization', adminToken)
        .send(inputData)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        id: expect.any(String),
        login: inputData.login,
        email: inputData.email,
        createdAt: expect.any(String),
      });
    });
  });
});