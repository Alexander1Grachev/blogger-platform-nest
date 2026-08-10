import { UpdateBlogDto } from "../../dto/blog.dto";

export class UpdateBlogInputDto implements UpdateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}