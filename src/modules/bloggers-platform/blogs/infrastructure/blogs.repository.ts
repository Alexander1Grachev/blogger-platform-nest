import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogDocument, type BlogModelType } from "../domain/blog.entity";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";
import { BlogDomainErrors } from "../domain/blog.errors";
import { DomainException } from "src/core/exceptions/domain-exceptions";

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) { }

  async save(newBlog: BlogDocument) {
    await newBlog.save();
  }

  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }


  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: BlogDomainErrors.NOT_FOUND,
      });
    }
    return blog;
  }
}