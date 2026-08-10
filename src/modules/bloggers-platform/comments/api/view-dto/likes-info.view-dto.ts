import { LikeStatus } from "src/modules/bloggers-platform/likes/domain/like-status";

export class LikesInfoViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}