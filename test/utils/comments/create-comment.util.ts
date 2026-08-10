/*
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PATHS } from 'src/core/paths/paths';
import { App } from 'supertest/types';
import { CommentViewDto } from 'src/modules/bloggers-platform/comments/api/view-dto/comments.view-dto';

export async function createCommentUtil(
  app: INestApplication<App>,
  postId: string,
  commentDto?: Partial<CreateCommentInputDto>,
): Promise<CommentViewDto> {

  const testCommentData: CreateCommentInputDto = { ...getCommentInputDto(postId), ...commentDto };

  const res = await request(app.getHttpServer)
    .POST(PATHS.COMMENTS)
    .send(testCommentData)
    .expect(HttpStatus.CREATED)

  return res.body;
}



export async function createManyCommentsUtil(
  app: INestApplication<App>,
  postId: string,
  count: number,
): Promise<CommentViewDto[]> {

  const comments: CommentViewDto[] = [];

  for (let i = 0; i < count; i++) {
    const comment = await createCommentUtil(app, postId);
    comments.push(comment);

  };
  return comments;

}
  */