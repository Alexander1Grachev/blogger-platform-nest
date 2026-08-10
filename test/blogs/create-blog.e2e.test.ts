import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PATHS } from 'src/core/paths/paths';
import { getTestApp } from 'test/utils/z.setup/get-test-app.utils';
import { clearDb } from 'test/utils/z.setup/clear-db';
import { getBlogInputDto } from 'test/utils/blogs/get-blog-input-dto';

describe('Create new blog (e2e)', () => {
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

  it('✅ should create blog with correct input data ', async () => {
    const inputDto = getBlogInputDto();

    const response = await request(app.getHttpServer())
      .post(PATHS.BLOGS)
      .send(inputDto)
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual({
      id: expect.any(String),
      name: inputDto.name,
      description: inputDto.description,
      websiteUrl: inputDto.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });
  });

});
