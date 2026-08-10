import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PATHS } from 'src/core/paths/paths';
import { App } from 'supertest/types';
import { getPostInputDto } from './get-post-input-dto';
import { PostViewDto } from 'src/modules/bloggers-platform/posts/api/view-dto/posts.view-dto';
import { CreatePostInputDto } from 'src/modules/bloggers-platform/posts/api/input-dto/posts.input-dto.ts';


export async function createPostUtil(
  app: INestApplication<App>,
  blogId: string,
  postDto?: Partial<CreatePostInputDto>,
): Promise<PostViewDto> {

  const testPostData: CreatePostInputDto = { ...getPostInputDto(blogId), ...postDto };

  const res = await request(app.getHttpServer())
    .post(PATHS.POSTS)
    .send(testPostData)
    .expect(HttpStatus.CREATED)

  return res.body;
}



export async function createManyPostsUtil(
  app: INestApplication<App>,
  blogId: string,
  count: number,
): Promise<PostViewDto[]> {

  const posts: PostViewDto[] = [];

  for (let i = 0; i < count; i++) {
    const post = await createPostUtil(app, blogId);
    posts.push(post);

  };
  return posts;

}