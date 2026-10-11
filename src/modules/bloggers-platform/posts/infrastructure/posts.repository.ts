import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Post, PostDocument, type PostModelType } from "../domain/post.entity";
import { DomainException } from "src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";
import { PostDomainErrors } from "../domain/post.errors";


@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) { }

  async save(newPost: PostDocument) {
    await newPost.save();
  }
  async findById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.findById(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: PostDomainErrors.NOT_FOUND,
      });
    }

    return post;
  }
}