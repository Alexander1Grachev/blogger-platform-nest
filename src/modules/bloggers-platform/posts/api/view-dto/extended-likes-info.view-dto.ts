import { LikeStatus } from "src/modules/bloggers-platform/likes/domain/like-status";
import { NewestLike } from "src/modules/bloggers-platform/likes/dto/newest-like.dto";

export class ExtendedLikesInfoViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLike[];
}