import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PATHS } from 'src/core/paths/paths';
import { App } from 'supertest/types';
import { createManyUsersUtil, createUserUtil } from 'test/utils/users/create-user.util';
import { clearDb } from 'test/utils/z.setup/clear-db';
import { getTestApp } from 'test/utils/z.setup/get-test-app.utils';
import { response } from 'express';


describe('Read users with paging (e2e)', () => {
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


  it('✅ should returns users with correct input data', async () => {
    const user = await createUserUtil(app);

    const response = await request(app.getHttpServer())
      .get(PATHS.USERS)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.any(String),
          login: user.login,
          email: user.email,
          createdAt: expect.any(String)
        }
      ]
    });
  });

  it('✅ should handle multiple pages', async () => {
    await createManyUsersUtil(app, 12);

    const res = await request(app.getHttpServer())
      .get(PATHS.USERS)
      .expect(HttpStatus.OK)

    expect(res.body.totalCount).toBe(12);
    expect(res.body.pagesCount).toBe(2);
    expect(res.body.items).toHaveLength(10);
  });
  it('✅ should respect custom pageSize', async () => {
    await createManyUsersUtil(app, 7);

    const res = await request(app.getHttpServer())
      .get(`${PATHS.USERS}?pageSize=5`)
      .expect(HttpStatus.OK)

    expect(res.body.pageSize).toBe(5);
    expect(res.body.items).toHaveLength(5);
  });
  it('✅ should respect page parameter', async () => {
    await createManyUsersUtil(app, 7);

    const res = await request(app.getHttpServer())
      .get(`${PATHS.USERS}?pageNumber=2&pageSize=5`)
      .expect(HttpStatus.OK)

    expect(res.body.page).toBe(2);
    expect(res.body.pageSize).toBe(5);
    expect(res.body.items).toHaveLength(2);
  });
  it('✅ should return empty array when no users', async () => {
    const res = await request(app.getHttpServer())
      .get(PATHS.USERS)
      .expect(HttpStatus.OK)

    expect(res.body.items).toHaveLength(0);
    expect(res.body.pagesCount).toBe(0);
    expect(res.body.totalCount).toBe(0);
  });
  it('✅ should filter users by searchLoginTerm', async () => {
    await createUserUtil(app, { login: 'Alpha1' });
    await createUserUtil(app, { login: 'Beta1' });
    await createUserUtil(app, { login: 'Beta2' });

    const res = await request(app.getHttpServer())
      .get(`${PATHS.USERS}?searchLoginTerm=Beta`)
      .expect(HttpStatus.OK)

    expect(res.body.totalCount).toBe(2);
    expect(res.body.items).toHaveLength(2);

    res.body.items.forEach((item: any) => {
      expect(item.login).toContain('Beta');
    })
  });
  it('✅ should return empty result if searchLoginTerm matches nothing', async () => {
    await createUserUtil(app, { login: 'Alpha1' });
    const response = await request(app.getHttpServer())
      .get(`${PATHS.USERS}?searchLoginTerm=NonExistent`)
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(0);
    expect(response.body.items).toHaveLength(0);
  });
  it('✅ should be case-insensitive on searchLoginTerm', async () => {
    await createUserUtil(app, { login: 'Alpha1' });
    const response = await request(app.getHttpServer())
      .get(`${PATHS.USERS}?searchLoginTerm=alpha1`)
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(1);
  });
  it('✅ should filter users by searchEmailTerm', async () => {
    await createUserUtil(app, { email: 'example1@email.com' });
    await createUserUtil(app, { email: 'example2@email.dev' });
    await createUserUtil(app, { email: 'example3@email.dev' });

    const response = await request(app.getHttpServer())
      .get(`${PATHS.USERS}?searchEmailTerm=dev`)
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(2);
    expect(response.body.items).toHaveLength(2);

    response.body.items.forEach((item: any) => {
      expect(item.email).toContain('dev')
    })
  });
  it('✅ should return empty result if searchEmailTerm matches nothing', async () => {
    await createUserUtil(app, { email: 'example1@email.com' });

    const response = await request(app.getHttpServer())
      .get(`${PATHS.USERS}?searchEmailTerm=NonExistent`)
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(0);
    expect(response.body.items).toHaveLength(0);
  });
  it('✅ should be case-insensitive on searchEmailTerm', async () => {
    await createUserUtil(app, { email: 'example1@email.com' });

    const response = await request(app.getHttpServer())
      .get(`${PATHS.USERS}?searchEmailTerm=Example1@email.com`)
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(1);
    expect(response.body.items).toHaveLength(1);
  });
  it('✅ should sort by name ascending', async () => {
    const users = await createManyUsersUtil(app, 3);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.USERS}?sortBy=createAt&sortDirection=asc`)
      .expect(HttpStatus.OK);

    const expectedOrder = [...users].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );

    expect(response.body.items.map((u) => u.id))
      .toEqual(expectedOrder.map((u) => u.id))
  });
  it('✅ should sort by createdAt descending by default', async () => {
    const users = await createManyUsersUtil(app, 3);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.USERS}`)
      .expect(HttpStatus.OK);

    const expectedOrder = [...users].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    expect(response.body.items.map((u) => u.id))
      .toEqual(expectedOrder.map((u) => u.id))
  });
})