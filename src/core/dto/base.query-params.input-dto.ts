import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export enum SortDirection {
    Asc = 'asc',
    Desc = 'desc',
}
export class BaseQueryParams {

    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageNumber: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize: number = 10;

    @IsEnum(SortDirection)
    sortDirection: SortDirection = SortDirection.Desc;

    calculateSkip() {
        return (this.pageNumber - 1) * this.pageSize;
    }
}
