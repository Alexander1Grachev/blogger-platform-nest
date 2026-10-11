import { HttpStatus, INestApplication } from "@nestjs/common"
import { PATHS } from "src/core/paths/paths";
import request from 'supertest';
import { App } from "supertest/types"
import { createBlogUtil } from "tests/utils/blogs/create-blog.util";
import { getBlogInputDto } from "tests/utils/blogs/get-blog-input-dto";
import { clearDb } from "tests/utils/z.setup/clear-db";
import { getTestApp } from "tests/utils/z.setup/get-test-app.utils";





describe('Update existing blog by id (e2e)', () => {
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
      .put(`${PATHS.BLOGS}/68dd420a59b32c41bb039999`)
      .send(getBlogInputDto())
      .expect(HttpStatus.NOT_FOUND)
  })

  it('❌ should return 404 when updating a deleted blog', async () => {
    const blog = await createBlogUtil(app);

    await request(app.getHttpServer())
      .delete(`${PATHS.BLOGS}/${blog.id}`)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(`${PATHS.BLOGS}/${blog.id}`)
      .send(getBlogInputDto())
      .expect(HttpStatus.NOT_FOUND);
  });

  it('✅ should not change createdAt after update', async () => {
    const blog = await createBlogUtil(app);
    const inputDto = getBlogInputDto();

    await request(app.getHttpServer())
      .put(`${PATHS.BLOGS}/${blog.id}`)
      .send(inputDto)
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/${blog.id}`)
      .expect(HttpStatus.OK);

    expect(res.body.createdAt).toBe(blog.createdAt);
  });

  it('✅ should returns updated blog with correct input data', async () => {
    const blog = await createBlogUtil(app);

    const inputDto = getBlogInputDto();

    await request(app.getHttpServer())
      .put(`${PATHS.BLOGS}/${blog.id}`)
      .send(inputDto)
      .expect(HttpStatus.NO_CONTENT)

    const res = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}/${blog.id}`)
      .expect(HttpStatus.OK)

    expect(res.body).toEqual({
      id: blog.id,
      name: inputDto.name,
      description: inputDto.description,
      websiteUrl: inputDto.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });
  })

})

