
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateBlogInputDto } from 'src/modules/bloggers-platform/blogs/api/input-dto/blogs.input-dto';
import { BlogViewDto } from 'src/modules/bloggers-platform/blogs/api/view-dto/blogs.view-dto';
import { getBlogInputDto } from './get-blog-input-dto';
import { PATHS } from 'src/core/paths/paths';
import { App } from 'supertest/types';

export async function createBlogUtil(
  app: INestApplication<App>,
  blogDto?: Partial<CreateBlogInputDto>,
): Promise<BlogViewDto> {

  const testBlogData: CreateBlogInputDto = { ...getBlogInputDto(), ...blogDto };

  const res = await request(app.getHttpServer())
    .post(PATHS.BLOGS)
    .send(testBlogData)
    .expect(HttpStatus.CREATED)

  return res.body;
}


export async function createManyBlogsUtil(
  app: INestApplication<App>,
  count: number,
): Promise<BlogViewDto[]> {

  const blogs: BlogViewDto[] = [];

  for (let i = 0; i < count; i++) {
    const blog = await createBlogUtil(app);
    blogs.push(blog);

  };
  return blogs;

}