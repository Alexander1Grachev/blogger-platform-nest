import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PATHS } from 'src/core/paths/paths';
import { App } from 'supertest/types';
import { createUserUtil } from 'test/utils/users/create-user.util';
import { clearDb } from 'test/utils/z.setup/clear-db';
import { getTestApp } from 'test/utils/z.setup/get-test-app.utils';


describe('Delete user by id (e2e)', () => {
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

  it('❌ should return 404 if user not found', async () => {
    await createUserUtil(app);
    await request(app.getHttpServer())
      .delete(`${PATHS.USERS}/68dd420a59b32c41bb039999`)
      .expect(HttpStatus.NOT_FOUND)
  });

  it('❌ should return 404 when delete a deleted user', async () => {
    const user = await createUserUtil(app);

    await request(app.getHttpServer())
      .delete(`${PATHS.USERS}/${user.id}`)
      .expect(HttpStatus.NO_CONTENT)

    await request(app.getHttpServer())
      .delete(`${PATHS.USERS}/${user.id}`)
      .expect(HttpStatus.NOT_FOUND)
  });

  it('✅ should delete user by id', async () => {
    const user = await createUserUtil(app);

    await request(app.getHttpServer())
      .delete(`${PATHS.USERS}/${user.id}`)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`${PATHS.USERS}/${user.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });
})