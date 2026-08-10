/*
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PATHS } from 'src/core/paths/paths';
import { getTestApp } from 'test/utils/z.setup/get-test-app.utils';
import { clearDb } from 'test/utils/z.setup/clear-db';
import { createPostUtil } from 'test/utils/posts/create-post.util';
import { createBlogUtil } from 'test/utils/blogs/create-blog.util';

describe('Read comments in post (e2e)', () => {
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
      .get(`${PATHS.POSTS}/68dd420a59b32c41bb039999/comments`)
      .expect(HttpStatus.NOT_FOUND)
  })



  it('✅ should get comments for specified post ', async () => {
    const blog = await createBlogUtil(app);
    const post = await createPostUtil(app, blog.id);
    const comments = await createCommentUtil(app, post.id)
    await request(app.getHttpServer())
      .get(`${PATHS.POSTS}/${PATHS.POSTS}/comments`)
      .expect(HttpStatus.OK)
  });
});
*/