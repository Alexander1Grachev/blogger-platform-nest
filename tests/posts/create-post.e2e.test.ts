import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PATHS } from 'src/core/paths/paths';
import { getTestApp } from 'tests/utils/z.setup/get-test-app.utils';
import { clearDb } from 'tests/utils/z.setup/clear-db';
import { getPostInputDto } from 'tests/utils/posts/get-post-input-dto';
import { createBlogUtil } from 'tests/utils/blogs/create-blog.util';

describe('Create new post (e2e)', () => {
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

  it('✅ should create post with correct input data ', async () => {
    const blog = await createBlogUtil(app);
    const inputDto = getPostInputDto(blog.id);
    
    const response = await request(app.getHttpServer())
      .post(PATHS.POSTS)
      .send(inputDto)
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual({
      id: expect.any(String),
      title: inputDto.title,
      shortDescription: inputDto.shortDescription,
      content: inputDto.content,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      }
    });
  });

});
