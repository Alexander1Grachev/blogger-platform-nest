import { HttpStatus, INestApplication } from "@nestjs/common"
import { PATHS } from "src/core/paths/paths";
import request from 'supertest';
import { App } from "supertest/types"
import { createBlogUtil } from "tests/utils/blogs/create-blog.util";
import { getBlogInputDto } from "tests/utils/blogs/get-blog-input-dto";
import { createPostUtil } from "tests/utils/posts/create-post.util";
import { getPostInputDto } from "tests/utils/posts/get-post-input-dto";
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


  it('❌ should return 404 if post not found', async () => {
    const blog = await createBlogUtil(app);

    await request(app.getHttpServer())
      .put(`${PATHS.POSTS}/68dd420a59b32c41bb039999`)
      .send(getPostInputDto(blog.id))
      .expect(HttpStatus.NOT_FOUND)
  })

  it('❌ should return 404 when updating a deleted post', async () => {
    const blog = await createBlogUtil(app);
    const post = await createPostUtil(app, blog.id);

    await request(app.getHttpServer())
      .delete(`${PATHS.POSTS}/${post.id}`)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(`${PATHS.POSTS}/${post.id}`)
      .send(getPostInputDto(blog.id))
      .expect(HttpStatus.NOT_FOUND);
  });

  it('✅ should not change createdAt after update', async () => {
    const blog = await createBlogUtil(app);
    const post = await createPostUtil(app, blog.id);

    const inputDto = getPostInputDto(blog.id);

    await request(app.getHttpServer())
      .put(`${PATHS.POSTS}/${post.id}`)
      .send(inputDto)
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(app.getHttpServer())
      .get(`${PATHS.POSTS}/${post.id}`)
      .expect(HttpStatus.OK);

    expect(res.body.createdAt).toBe(post.createdAt);
  });

  it('✅ should returns updated post with correct input data', async () => {
    const blog = await createBlogUtil(app);
    const post = await createPostUtil(app, blog.id);
    const inputDto = getPostInputDto(blog.id);

    await request(app.getHttpServer())
      .put(`${PATHS.POSTS}/${post.id}`)
      .send(inputDto)
      .expect(HttpStatus.NO_CONTENT)

    const res = await request(app.getHttpServer())
      .get(`${PATHS.POSTS}/${post.id}`)
      .expect(HttpStatus.OK)

    expect(res.body).toEqual({
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
  })

})

