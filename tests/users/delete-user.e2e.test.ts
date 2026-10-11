import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PATHS } from 'src/core/paths/paths';
import { App } from 'supertest/types';
import { createUserUtil } from '../utils/users/create-user.util';
import { clearDb } from '../utils/z.setup/clear-db';
import { getTestApp } from '../utils/z.setup/get-test-app.utils';
import { generateBasicAuthToken } from '../utils/generate-admin-auth-token';


describe('Delete user by id (e2e)', () => {
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

  it('❌ should return 404 if user not found', async () => {
    await createUserUtil(app);
    await request(app.getHttpServer())
      .delete(`${PATHS.USERS}/68dd420a59b32c41bb039999`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NOT_FOUND)
  });

  it('❌ should return 404 when delete a deleted user', async () => {
    const user = await createUserUtil(app);

    await request(app.getHttpServer())
      .delete(`${PATHS.USERS}/${user.id}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NO_CONTENT)

    await request(app.getHttpServer())
      .delete(`${PATHS.USERS}/${user.id}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NOT_FOUND)
  });

  it('✅ should delete user by id', async () => {
    const user = await createUserUtil(app);

    await request(app.getHttpServer())
      .delete(`${PATHS.USERS}/${user.id}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`${PATHS.USERS}/${user.id}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NOT_FOUND);
  });
})