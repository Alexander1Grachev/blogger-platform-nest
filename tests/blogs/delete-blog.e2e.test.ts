import { HttpStatus, INestApplication } from "@nestjs/common";
import request from 'supertest';
import { PATHS } from "src/core/paths/paths";
import { App } from "supertest/types";
import { clearDb } from "tests/utils/z.setup/clear-db";
import { getTestApp } from "tests/utils/z.setup/get-test-app.utils";
import { createBlogUtil } from "tests/utils/blogs/create-blog.util";

describe('Delete blog by id (e2e)', () => {
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
    await request(app.getHttpServer())
      .delete(`${PATHS.BLOGS}/68dd420a59b32c41bb039999`)
      .expect(HttpStatus.NOT_FOUND)
  })

  it('❌ should return 404 when delete a deleted blog', async () => {
    const blog = await createBlogUtil(app);

    await request(app.getHttpServer())
      .delete(`${PATHS.BLOGS}/${blog.id}`)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .delete(`${PATHS.BLOGS}/${blog.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('✅ should delete blog by id', async () => {
    const blog = await createBlogUtil(app);

    await request(app.getHttpServer())
      .delete(`${PATHS.BLOGS}/${blog.id}`)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/${blog.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

})

