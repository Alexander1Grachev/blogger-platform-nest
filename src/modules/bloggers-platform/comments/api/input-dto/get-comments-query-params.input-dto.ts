import { BaseQueryParams } from "src/core/dto/base.query-params.input-dto";
import { CommentsSortBy } from "./comments-sort-by";

export class GetCommentsQueryParams extends BaseQueryParams {
  sortBy = CommentsSortBy.CreatedAt;
}