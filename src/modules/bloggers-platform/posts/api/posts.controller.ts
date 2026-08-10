
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { PostsService } from "../application/posts.service";
import { PostsQueryRepository } from "../infrastructure/query/posts.query-repository";
import { PostViewDto } from "./view-dto/posts.view-dto";
import { PaginatedViewDto } from "src/core/dto/base.paginated.view-dto";
import { GetPostsQueryParams } from "./input-dto/get-posts-query-params.input-dto";
import { CommentViewDto } from "../../comments/api/view-dto/comments.view-dto";
import { GetCommentsQueryParams } from "../../comments/api/input-dto/get-comments-query-params.input-dto";
import { PostsRepository } from "../infrastructure/posts.repository";
import { CommentsQueryRepository } from "../../comments/infrastructure/query/comments.query-repository";
import { ApiParam } from "@nestjs/swagger";
import { CreatePostInputDto } from "./input-dto/posts.input-dto.ts";
import { UpdatePostInputDto } from "./input-dto/update-post.input-dto";


@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsRepository: PostsRepository,
    private postsQueryRepository: PostsQueryRepository,

    private commentsQueryRepository: CommentsQueryRepository,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const postId = await this.postsService.create(body);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePostInputDto
  ): Promise<void> {
    return this.postsService.update(id, body);
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {

    return this.postsService.delete(id);
  }

  @ApiParam({ name: 'id' })
  @Get(':id')
  async getById(@Param('id') id: string): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  async getList(@Query() query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getList(query);
  }

  @Get('/:id/comments')
  async getCommentsList(
    @Query() query: GetCommentsQueryParams,
    @Param('id') postId: string
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {

    await this.postsRepository.findOrNotFoundFail(postId);

    return this.commentsQueryRepository.getList(query, postId);
  }

}