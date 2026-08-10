import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PATHS } from 'src/core/paths/paths';
import { getTestApp } from 'test/utils/z.setup/get-test-app.utils';
import { clearDb } from 'test/utils/z.setup/clear-db';
import { createBlogUtil } from 'test/utils/blogs/create-blog.util';
import { getPostForBlogInputDto } from 'test/utils/posts/get-post-input-dto';

describe('Create post for specific blog (e2e)', () => {
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
      .post(`${PATHS.BLOGS}/68dd420a59b32c41bb039999/posts`)
      .send(getPostForBlogInputDto())
      .expect(HttpStatus.NOT_FOUND);
  });

  it('✅ should returns post with correct input data for specific blog ', async () => {
    console.log('1. before createBlogUtil');
    const blog = await createBlogUtil(app);
    console.log('2. blog created:', blog);

    const inputDto = getPostForBlogInputDto()
    console.log('3. before post request');
    const response = await request(app.getHttpServer())
      .post(`${PATHS.BLOGS}/${blog.id}/posts`)
      .send(inputDto)
      .expect(HttpStatus.CREATED);
    console.log('4. post created');
    
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