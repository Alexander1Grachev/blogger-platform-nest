import { BlogDocument } from "../../domain/blog.entity";


export class BlogViewDto {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    isMembership: boolean
    createdAt: string;

    static mapToView(blog: BlogDocument): BlogViewDto {
        const dto = new BlogViewDto();
        dto.id = blog.id;
        dto.name = blog.name;
        dto.description = blog.description;
        dto.websiteUrl = blog.websiteUrl;
        dto.isMembership = blog.isMembership;
        dto.createdAt = blog.createdAt.toISOString();

        return dto;
    }
}