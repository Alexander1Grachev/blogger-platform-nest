import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';

// blogs
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';

// posts
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsController } from './posts/api/posts.controller';
import { PostsService } from './posts/application/posts.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';

// comments
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ])
  ],
  controllers: [
    BlogsController,
    PostsController,
    CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,

    PostsService,
    PostsRepository,
    PostsQueryRepository,

    // CommentsService,
    //CommentsRepository,
    CommentsQueryRepository,
  ]
})
export class BloggersPlatformModule { }
