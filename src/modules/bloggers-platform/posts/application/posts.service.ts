import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Post, type PostModelType } from "../domain/post.entity";
import { PostViewDto } from "../api/view-dto/posts.view-dto";
import { PostsRepository } from "../infrastructure/posts.repository";
import { BlogsRepository } from "../../blogs/infrastructure/blogs.repository";
import { CreatePostDto, UpdatePostDto } from "../dto/post.dto";



@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) { }

  async create(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogsRepository.findOrNotFoundFail(dto.blogId);
    const post = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    })

    await this.postsRepository.save(post);
    return post._id.toString();
  }

  async update(id: string, dto: UpdatePostDto): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);

    post.update(dto);
    await this.postsRepository.save(post);
  }

  async delete(id: string,): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    await this.postsRepository.save(post);
  }

}