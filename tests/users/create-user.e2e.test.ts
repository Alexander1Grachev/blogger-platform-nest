import { HttpStatus, INestApplication } from '@nestjs/common';
import { PATHS } from 'src/core/paths/paths';
import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/users.input-dto';
import request from 'supertest';
import { App } from 'supertest/types';
import { generateBasicAuthToken } from '../utils/generate-admin-auth-token';
import { getUserInputDto } from '../utils/users/get-user-input-dto';
import { clearDb } from '../utils/z.setup/clear-db';
import { getTestApp } from '../utils/z.setup/get-test-app.utils';


describe('Create new user (e2e)', () => {
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


  it('❌ should not create user without auth', async () => {
    const inputData = await getUserInputDto();

    await request(app.getHttpServer())
      .post(PATHS.USERS)
      .send(inputData)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('❌ should not create user with wrong auth', async () => {
    const inputData = await getUserInputDto();

    await request(app.getHttpServer())
      .post(PATHS.USERS)
      .set('Authorization',
        'Basic ' + Buffer.from('wrong:creds').toString('base64'),//пробел после Basic
      )
      .send(inputData)
      .expect(HttpStatus.UNAUTHORIZED);
  })
  it('❌ should not create user with invalid attributes', async () => {
    const invalidTestUserAttributes: CreateUserInputDto = {
      login: '   ',
      password: 'a'.repeat(600),
      email: 'new1usermail.com',
    }
    const invalidResponse = await request(app.getHttpServer())
      .post(PATHS.USERS)
      .set('Authorization', adminToken)
      .send(invalidTestUserAttributes)
      .expect(HttpStatus.BAD_REQUEST)

    expect(invalidResponse.body.errorsMessages).toHaveLength(3);

    const userList = await request(app.getHttpServer())
      .get(PATHS.USERS)
      .set('Authorization', adminToken)
      .expect(HttpStatus.OK)
    expect(userList.body.items).toHaveLength(0)
    expect(userList.body.totalCount).toBe(0);
  })




  it('❌ should not create user with same attributes', async () => {
    const inputData = await getUserInputDto();

    const firstResponse = await request(app.getHttpServer())
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

    const res = await request(app.getHttpServer())
      .get(PATHS.USERS)
      .set('Authorization', adminToken)
      .expect(HttpStatus.OK)
    console.log('GET /users response body:', res.body);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.totalCount).toBe(1);
  })


  it('✅ should create user with correct input data', async () => {
    const inputData = await getUserInputDto();

    const res = await request(app.getHttpServer())
      .post(PATHS.USERS)
      .set('Authorization', adminToken)
      .send(inputData)
      .expect(HttpStatus.CREATED)


    expect(res.body).toEqual({
      id: expect.any(String),
      login: inputData.login,
      email: inputData.email,
      createdAt: expect.any(String)
    })
  });

})