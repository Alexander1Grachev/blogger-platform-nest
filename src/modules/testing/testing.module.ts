import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../bloggers-platform/blogs/domain/blog.entity';
import { Post, PostSchema } from '../bloggers-platform/posts/domain/post.entity';
import { Comment, CommentSchema } from '../bloggers-platform/comments/domain/comment.entity';
import { User, UserSchema } from '../user-accounts/domain/user.entity';
import { TestingController } from './api/testing.controller';

@Module({
  imports: [
    // testing-модулю нужны модели ВСЕХ сущностей, чтобы их очистить
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class AppTestingModule { }