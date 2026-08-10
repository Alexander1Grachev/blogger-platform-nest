import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { BlogsService } from "../application/blogs.service";
import { BlogsQueryRepository } from "../infrastructure/query/blogs.query-repository";
import { CreateBlogInputDto } from "./input-dto/blogs.input-dto";
import { BlogViewDto } from "./view-dto/blogs.view-dto";
import { UpdateBlogInputDto } from "./input-dto/update-blog.input-dto";
import { PaginatedViewDto } from "src/core/dto/base.paginated.view-dto";
import { GetBlogsQueryParams } from "./input-dto/get-blogs-query-params.input-dto";
import { PostViewDto } from "../../posts/api/view-dto/posts.view-dto";
import { GetPostsQueryParams } from "../../posts/api/input-dto/get-posts-query-params.input-dto";
import { BlogsRepository } from "../infrastructure/blogs.repository";
import { PostsQueryRepository } from "../../posts/infrastructure/query/posts.query-repository";
import { CreatePostForBlogInputDto, CreatePostInputDto } from "../../posts/api/input-dto/posts.input-dto.ts";
import { PostsService } from "../../posts/application/posts.service";
import { ApiParam } from "@nestjs/swagger";


@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsRepository: BlogsRepository,
    private blogsQueryRepository: BlogsQueryRepository,

    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.create(body);

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto
  ): Promise<void> {
    return this.blogsService.update(id, body);
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {

    return this.blogsService.delete(id);
  }

  @ApiParam({ name: 'id' })
  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  async getList(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getList(query);
  }

  @Get('/:id/posts')
  async getPostsList(
    @Query() query: GetPostsQueryParams,
    @Param('id') blogId: string
  ): Promise<PaginatedViewDto<PostViewDto[]>> {

    await this.blogsRepository.findOrNotFoundFail(blogId);

    return this.postsQueryRepository.getList(query, blogId);
  }

  @Post('/:id/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.postsService.create({
      title: body.title,
      shortDescription: body.shortDescription,
      content: body.content,
      blogId: blogId,
    });
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }
}