import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Post, type PostModelType } from "../../domain/post.entity";
import { PaginatedViewDto } from "src/core/dto/base.paginated.view-dto";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { QueryFilter } from "mongoose";
import { GetPostsQueryParams } from "../../api/input-dto/get-posts-query-params.input-dto";

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name)
  private PostModel: PostModelType,
  ) { }

  async getByIdOrNotFoundFail(id: string): Promise<PostViewDto> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!post) {
      throw new NotFoundException('post not found')
    }
    return PostViewDto.mapToView(post);
  }

  async getList(
    query: GetPostsQueryParams,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: QueryFilter<Post> = {
      deletedAt: null,
    }
    if (blogId) {
      filter.blogId = blogId;
    }
    const posts = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);
    const totalCount = await this.PostModel.countDocuments(filter);

    const items = posts.map(PostViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });

  }
}