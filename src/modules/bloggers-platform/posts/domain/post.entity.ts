import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { ExtendedLikesInfoViewDto } from "../api/view-dto/extended-likes-info.view-dto";
import { CreatePostDomainDto } from "./dto/create-post.domain.dto";
import { UpdatePostDto } from "../dto/post.dto";
import { DomainException } from "src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";
import { CommonDomainErrors } from "src/core/exceptions/common-domain-errors";


@Schema({ timestamps: true })
export class Post {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  shortDescription: string;
  @Prop({ type: String, required: true })
  content: string;
  @Prop({ type: String, required: true })
  blogId: string;
  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  static createInstance(
    dto: CreatePostDomainDto,
  ): PostDocument {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;

    return post as PostDocument;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: CommonDomainErrors.ALREADY_DELETED,
      });
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdatePostDto): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;