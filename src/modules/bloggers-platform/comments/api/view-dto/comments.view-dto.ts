import { PostViewDto } from "src/modules/bloggers-platform/posts/api/view-dto/posts.view-dto";
import { LikesInfoViewDto } from "./likes-info.view-dto";
import { LikeStatus } from "src/modules/bloggers-platform/likes/domain/like-status";
import { CommentDocument } from "../../domain/comment.entity";

export class CommentatorInfoDto {
  userId: string;
  userLogin: string;
};


export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoDto;
  likesInfo: LikesInfoViewDto;
  createdAt: string;

  static mapToView(comment: CommentDocument): CommentViewDto {
    const dto = new CommentViewDto();
    dto.id = comment.id;
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt.toISOString();
    // заглушка, лайков пока нет
    dto.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
    };
    return dto;
  }
}