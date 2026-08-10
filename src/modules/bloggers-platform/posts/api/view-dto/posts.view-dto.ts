import { LikeStatus } from "src/modules/bloggers-platform/likes/domain/like-status";
import { ExtendedLikesInfoViewDto } from "./extended-likes-info.view-dto";
import { PostDocument } from "../../domain/post.entity";

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewDto;

  static mapToView(post: PostDocument): PostViewDto { // likesInfo: ExtendedLikesInfoViewDto
    const dto = new PostViewDto();
    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt.toISOString();

    // заглушка, лайков пока нет
    dto.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [],
    };
    return dto;
  }
}