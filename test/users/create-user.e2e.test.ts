import { HttpStatus, INestApplication } from '@nestjs/common';
import { PATHS } from 'src/core/paths/paths';
import request from 'supertest';
import { App } from 'supertest/types';
import { getUserInputDto } from 'test/utils/users/get-user-input-dto';
import { clearDb } from 'test/utils/z.setup/clear-db';
import { getTestApp } from 'test/utils/z.setup/get-test-app.utils';


describe('Create new user (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await getTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(async () => {
    await clearDb(app);
  });


  it('✅ should create user with correct input data', async () => {
    const inputData = await getUserInputDto();

    const res = await request(app.getHttpServer())
      .post(PATHS.USERS)
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