import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, type BlogModelType } from "../domain/blog.entity";
import { BlogsRepository } from "../infrastructure/blogs.repository";
import { CreateBlogDto, UpdateBlogDto } from "../dto/blog.dto";


@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository
  ) { }

  async create(dto: CreateBlogDto): Promise<string> {
    const blog = this.BlogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save(blog);
    return blog.id;
  }

  async update(id: string, dto: UpdateBlogDto): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);

    blog.update(dto);
    await this.blogsRepository.save(blog);
  }

  async delete(id: string): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);

    blog.makeDeleted();

    await this.blogsRepository.save(blog);
  }
}