import { Controller, Get, Param } from "@nestjs/common";
import { CommentViewDto } from "./view-dto/comments.view-dto";
import { CommentsQueryRepository } from "../infrastructure/query/comments.query-repository";
import { ApiParam } from "@nestjs/swagger";



@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository
  ) { }

  @ApiParam({ name: 'id' })
  @Get(':id')
  async getById(@Param('id') id: string): Promise<CommentViewDto> {
    return this.commentsQueryRepository.getByIdOrNotFoundFail(id);
  }
}