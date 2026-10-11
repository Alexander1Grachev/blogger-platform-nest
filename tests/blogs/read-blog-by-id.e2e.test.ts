import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PATHS } from 'src/core/paths/paths';
import { getTestApp } from 'tests/utils/z.setup/get-test-app.utils';
import { clearDb } from 'tests/utils/z.setup/clear-db';
import { createBlogUtil } from 'tests/utils/blogs/create-blog.util';

describe('Read blog by id (e2e)', () => {
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

  it('✅ should get blog by id', async () => {
    const blog = await createBlogUtil(app);

    const res = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/${blog.id}`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({
      id: expect.any(String),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });
  });

  it('❌ should return 404 if blog not found', async () => {
    const res = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/68dd420a59b32c41bb039999`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
