import { CreatePostForBlogInputDto, CreatePostInputDto } from "src/modules/bloggers-platform/posts/api/input-dto/posts.input-dto.ts";




export function getPostInputDto(
  blogId: string,
  overrides?: Partial<CreatePostInputDto>,
): CreatePostInputDto {
  const randomNum = Math.floor(Math.random() * 10000);
  return {
    title: `Title${randomNum}`,
    shortDescription: `ShortDescription${randomNum}`,
    content: `Content${randomNum}`,
    blogId: blogId,
    ...overrides,
  }
}

export function getPostForBlogInputDto(
  overrides?: Partial<CreatePostForBlogInputDto>,
): CreatePostForBlogInputDto {
  const randomNum = Math.floor(Math.random() * 10000);
  return {
    title: `Title${randomNum}`,
    shortDescription: `ShortDescription${randomNum}`,
    content: `Content${randomNum}`,
    ...overrides,
  }
}