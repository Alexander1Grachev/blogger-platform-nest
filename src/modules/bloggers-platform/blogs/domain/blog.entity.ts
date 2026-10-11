import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { CreateBlogDomainDto } from "./dto/create-blog.domain.dto";
import { UpdateBlogDto } from "../dto/blog.dto";
import { DomainException } from "src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";
import { CommonDomainErrors } from "src/core/exceptions/common-domain-errors";

@Schema({ timestamps: true })
export class Blog {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: String, required: true })
  websiteUrl: string;
  @Prop({ type: Boolean, default: false })
  isMembership: boolean


  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  static createInstance(
    dto: CreateBlogDomainDto
  ): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;

    return blog as BlogDocument;
  }

  get id() {
    return this._id.toString();
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

  update(dto: UpdateBlogDto): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelType = Model<BlogDocument> & typeof Blog;



