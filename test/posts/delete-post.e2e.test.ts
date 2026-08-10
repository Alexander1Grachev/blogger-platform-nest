import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PATHS } from 'src/core/paths/paths';
import { getTestApp } from 'test/utils/z.setup/get-test-app.utils';
import { clearDb } from 'test/utils/z.setup/clear-db';
import { createPostUtil } from 'test/utils/posts/create-post.util';
import { createBlogUtil } from 'test/utils/blogs/create-blog.util';

describe('Deletes post by id (e2e)', () => {
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

  it('❌ should return 404 if post not found', async () => {
    await request(app.getHttpServer())
      .delete(`${PATHS.POSTS}/68dd420a59b32c41bb039999`)
      .expect(HttpStatus.NOT_FOUND)
  })

  it('❌ should return 404 when delete a deleted blog', async () => {
    const blog = await createBlogUtil(app);
    const post = await createPostUtil(app, blog.id);

    await request(app.getHttpServer())
      .delete(`${PATHS.POSTS}/${post.id}`)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .delete(`${PATHS.POSTS}/${post.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('✅ should delete post by id ', async () => {
    const blog = await createBlogUtil(app);
    const post = await createPostUtil(app, blog.id);

    await request(app.getHttpServer())
      .delete(`${PATHS.POSTS}/${post.id}`)
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.POSTS}/${post.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

});
