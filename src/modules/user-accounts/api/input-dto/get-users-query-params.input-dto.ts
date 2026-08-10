import { BaseQueryParams } from "src/core/dto/base.query-params.input-dto";
import { UsersSortBy } from "./users-sort-by";

export class GetUsersQueryParams extends BaseQueryParams {
    sortBy = UsersSortBy.CreatedAt;
    searchLoginTerm: string | null = null;
    searchEmailTerm: string | null = null;
}