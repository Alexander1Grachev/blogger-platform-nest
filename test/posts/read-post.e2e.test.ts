import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PATHS } from 'src/core/paths/paths';
import { getTestApp } from 'test/utils/z.setup/get-test-app.utils';
import { clearDb } from 'test/utils/z.setup/clear-db';
import { getPostInputDto } from 'test/utils/posts/get-post-input-dto';
import { createBlogUtil } from 'test/utils/blogs/create-blog.util';
import { createManyPostsUtil, createPostUtil } from 'test/utils/posts/create-post.util';

describe('Read posts with paging (e2e)', () => {
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

  it('✅ should returns posts with correct input data ', async () => {
    const blog = await createBlogUtil(app);

    const post = await createPostUtil(app, blog.id);

    const response = await request(app.getHttpServer())
      .get(PATHS.POSTS)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [{
        id: expect.any(String),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        }
      }]
    });
  });


  it('✅ should handle multiple pages', async () => {
    const blog = await createBlogUtil(app);
    const posts = await createManyPostsUtil(app, blog.id, 12);

    const response = await request(app.getHttpServer())
      .get(PATHS.POSTS)
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(12);
    expect(response.body.pagesCount).toBe(2);
    expect(response.body.items).toHaveLength(10);
  })

  it('✅ should respect custom pageSize', async () => {
    const blog = await createBlogUtil(app);
    const posts = await createManyPostsUtil(app, blog.id, 7);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.POSTS}?pageSize=5`)
      .expect(HttpStatus.OK);

    expect(response.body.pageSize).toBe(5);
    expect(response.body.items).toHaveLength(5);
  })

  it('✅ should respect page parameter', async () => {
    const blog = await createBlogUtil(app);
    const posts = await createManyPostsUtil(app, blog.id, 7);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.POSTS}?pageNumber=2&pageSize=5`)
      .expect(HttpStatus.OK);

    expect(response.body.page).toBe(2);
    expect(response.body.pageSize).toBe(5);
    expect(response.body.items).toHaveLength(2); // 7 блогов, 5 и 2 
  });

  it('✅ should return empty array when no posts ', async () => {
    const response = await request(app.getHttpServer())
      .get(PATHS.POSTS)
      .expect(HttpStatus.OK);

    expect(response.body.items).toHaveLength(0);
    expect(response.body.pagesCount).toBe(0);
    expect(response.body.totalCount).toBe(0);
  });

  it('✅ should sort by name ascending', async () => {
    const blog = await createBlogUtil(app);
    const posts = await createManyPostsUtil(app, blog.id, 3);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.POSTS}?sortBy=createAt&sortDirection=asc`)
      .expect(HttpStatus.OK);

    const expectedOrder = [...posts].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );

    expect(response.body.items.map((p) => p.id))
      .toEqual(expectedOrder.map((p) => p.id))
  });

  it('✅ should sort by createdAt descending by default', async () => {
    const blog = await createBlogUtil(app);
    const posts = await createManyPostsUtil(app, blog.id, 3);

    const response = await request(app.getHttpServer())
      .get(`${PATHS.POSTS}`)
      .expect(HttpStatus.OK);

    const expectedOrder = [...posts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    expect(response.body.items.map((p) => p.id))
      .toEqual(expectedOrder.map((p) => p.id))
  });

});
