import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UserViewDto } from './view-dto/users.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
    constructor(
        private usersQueryRepository: UsersQueryRepository,
        private usersService: UsersService,
    ) { }

    @Get()
    async getList(
        @Query() query: GetUsersQueryParams,
    ): Promise<PaginatedViewDto<UserViewDto[]>> {
        return this.usersQueryRepository.getList(query);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() body: CreateUserInputDto,
    ): Promise<UserViewDto> {
        const userId = await this.usersService.create(body);
        return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
    }

    @ApiParam({ name: 'id' })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('id') id: string,
    ): Promise<void> {
        return this.usersService.delete(id);
    }
}
