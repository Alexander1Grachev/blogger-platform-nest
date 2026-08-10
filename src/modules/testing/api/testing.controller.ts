import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../../bloggers-platform/blogs/domain/blog.entity';
import { Post, PostDocument } from '../../bloggers-platform/posts/domain/post.entity';
import { Comment, CommentDocument } from '../../bloggers-platform/comments/domain/comment.entity';
import { User, UserDocument } from '../../user-accounts/domain/user.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
  ) { }

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearDb(): Promise<void> {
    await Promise.all([
      this.BlogModel.deleteMany(),
      this.PostModel.deleteMany(),
      this.CommentModel.deleteMany(),
      this.UserModel.deleteMany(),
    ]);
  }
}