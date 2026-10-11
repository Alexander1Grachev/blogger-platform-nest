import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PATHS } from 'src/core/paths/paths';
import { getTestApp } from 'tests/utils/z.setup/get-test-app.utils';
import { clearDb } from 'tests/utils/z.setup/clear-db';
import { createBlogUtil } from 'tests/utils/blogs/create-blog.util';
import { createManyPostsUtil } from 'tests/utils/posts/create-post.util';

describe('Read posts for specific blog (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDb(app);
  });

  it('❌ should return 404 if blog not found', async () => {
    const res = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/68dd420a59b32c41bb039999/posts`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('✅ should returns posts with correct input data ', async () => {
    const blog = await createBlogUtil(app);

    await createManyPostsUtil(app, blog.id, 12);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/${blog.id}/posts`)
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(12);
    expect(response.body.pagesCount).toBe(2);
    expect(response.body.items).toHaveLength(10)
  })

  it('✅ should respect custom pageSize', async () => {
    const blog = await createBlogUtil(app);

    await createManyPostsUtil(app, blog.id, 7);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/${blog.id}/posts?pageSize=5`)
      .expect(HttpStatus.OK);

    expect(response.body.pageSize).toBe(5)
    expect(response.body.items).toHaveLength(5);
  })

  it('✅ should respect page parameter', async () => {
    const blog = await createBlogUtil(app);

    await createManyPostsUtil(app, blog.id, 7)

    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/${blog.id}/posts?pageNumber=2&pageSize=5`)
      .expect(HttpStatus.OK);

    expect(response.body.page).toBe(2);
    expect(response.body.pageSize).toBe(5);
    expect(response.body.items).toHaveLength(2); // 7 блогов, 5 и 2 
  });

  it('✅ should return empty array when no posts', async () => {

    const blog = await createBlogUtil(app);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/${blog.id}/posts`)
      .expect(HttpStatus.OK)

    expect(response.body.items).toHaveLength(0);
    expect(response.body.pagesCount).toBe(0);
    expect(response.body.totalCount).toBe(0);
  })

  it('✅ should sort by createdAt ascending', async () => {
    const blog = await createBlogUtil(app);
    const posts = await createManyPostsUtil(app, blog.id, 3);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/${blog.id}/posts?sortBy=createdAt&sortDirection=asc`)
      .expect(HttpStatus.OK);

    const expectedOrder = [...posts].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );
    expect(response.body.items.map((p) => p.id))
      .toEqual(expectedOrder.map((p) => p.id))
  })

  it('✅ should sort by createdAt  descending by default', async () => {
    const blog = await createBlogUtil(app);
    const posts = await createManyPostsUtil(app, blog.id, 3);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/${blog.id}/posts`)
      .expect(HttpStatus.OK);

    const expectedOrder = [...posts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
    expect(response.body.items.map((p) => p.id))
      .toEqual(expectedOrder.map((p) => p.id))
  })
});