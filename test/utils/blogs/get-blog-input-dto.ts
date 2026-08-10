import { CreateBlogInputDto } from "src/modules/bloggers-platform/blogs/api/input-dto/blogs.input-dto";

export function getBlogInputDto(overrides?: Partial<CreateBlogInputDto>): CreateBlogInputDto {
  const randomNum = Math.floor(Math.random() * 10000);
  return {
    name: `Name${randomNum}`,
    description: `Description${randomNum}`,
    websiteUrl: `https://website${randomNum}.com`,
    ...overrides,
  };
}