import { BaseQueryParams } from "src/core/dto/base.query-params.input-dto";
import { UsersSortBy } from "./users-sort-by";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class GetUsersQueryParams extends BaseQueryParams {

    @IsEnum(UsersSortBy)
    sortBy: UsersSortBy = UsersSortBy.CreatedAt;

    @IsOptional()
    @IsString()
    searchLoginTerm: string | null = null;

    @IsOptional()
    @IsString()
    searchEmailTerm: string | null = null;
}