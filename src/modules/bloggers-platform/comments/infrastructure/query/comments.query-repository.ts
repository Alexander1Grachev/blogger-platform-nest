import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Comment, type CommentModeltype } from "../../domain/comment.entity";
import { CommentViewDto } from "../../api/view-dto/comments.view-dto";
import { PaginatedViewDto } from "src/core/dto/base.paginated.view-dto";
import { QueryFilter } from "mongoose";
import { GetCommentsQueryParams } from "../../api/input-dto/get-comments-query-params.input-dto";
import { DomainException } from "src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";
import { CommentDomainErrors } from "../../domain/comment.errors";



@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModeltype,
  ) { }

  async getByIdOrNotFoundFail(id: string): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null
    });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: CommentDomainErrors.NOT_FOUND,
      });
    }
    return CommentViewDto.mapToView(comment);
  }

  async getList(
    query: GetCommentsQueryParams,
    postId: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {

    const filter: QueryFilter<Comment> = {
      deletedAt: null,
    };

    if (postId) {
      filter.postId = postId
    };

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)

    const totalCount = await this.CommentModel.countDocuments(filter);
    const items = comments.map(CommentViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    })
  }
}