import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PATHS } from 'src/core/paths/paths';
import { getTestApp } from 'tests/utils/z.setup/get-test-app.utils';
import { clearDb } from 'tests/utils/z.setup/clear-db';
import { createBlogUtil, createManyBlogsUtil } from 'tests/utils/blogs/create-blog.util';

describe('Read blogs with paging (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDb(app);
  });

  it('✅ should returns blogs with correct input data ', async () => {
    const blog = await createBlogUtil(app);

    const response = await request(app.getHttpServer())
      .get(PATHS.BLOGS)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.any(String),
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          createdAt: expect.any(String),
          isMembership: false,
        }
      ]
    });
  });

  it('✅ should handle multiple pages', async () => {
    //Создаем 12 постов 
    await createManyBlogsUtil(app, 12)


    const response = await request(app.getHttpServer()).get(PATHS.BLOGS).expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(12);
    expect(response.body.pagesCount).toBe(2); // 12/10 = 2 страницы
    expect(response.body.items).toHaveLength(10); // первая страница = 10 постов
  });

  it('✅ should respect custom pageSize', async () => {
     await createManyBlogsUtil(app, 7)
     
    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}?pageSize=5`)
      .expect(HttpStatus.OK);

    expect(response.body.pageSize).toBe(5);
    expect(response.body.items).toHaveLength(5); // 5 блогов на странице
  });

  it('✅ should respect page parameter', async () => {
      await createManyBlogsUtil(app, 7)

    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}?pageNumber=2&pageSize=5`)
      .expect(HttpStatus.OK);

    expect(response.body.page).toBe(2);
    expect(response.body.pageSize).toBe(5);
    expect(response.body.items).toHaveLength(2); // 7 блогов, 5 и 2 

  });

  it('✅ should return empty array when no blogs ', async () => {
    const response = await request(app.getHttpServer()).get(PATHS.BLOGS).expect(HttpStatus.OK);

    expect(response.body.items).toHaveLength(0);
    expect(response.body.pagesCount).toBe(0);
    expect(response.body.totalCount).toBe(0);
  });

  it('✅ should filter blogs by searchNameTerm', async () => {
    await createBlogUtil(app, { name: 'Tech Blog' });
    await createBlogUtil(app, { name: 'Travel Blog' });
    await createBlogUtil(app, { name: 'Cooking Diary' });

    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}?searchNameTerm=Blog`)
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(2);
    expect(response.body.items).toHaveLength(2);
    // проверяем, 2 из 3х содержат Blog
    response.body.items.forEach((item: any) => {
      expect(item.name).toContain('Blog');
    });
  });

  it('✅ should return empty result if searchNameTerm matches nothing', async () => {
    await createBlogUtil(app, { name: 'Tech Blog' });

    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}?searchNameTerm=NonExistent`)
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(0);
    expect(response.body.items).toHaveLength(0);
  });

  it('✅ should be case-insensitive on searchNameTerm', async () => {
    await createBlogUtil(app, { name: 'JavaScript Blog' });

    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}?searchNameTerm=javascript`)
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(1);
  });

  it('✅ should sort by name ascending', async () => {
    await createBlogUtil(app, { name: 'Charlie' });
    await createBlogUtil(app, { name: 'Alpha' });
    await createBlogUtil(app, { name: 'Bravo' });

    const response = await request(app.getHttpServer())
      .get(`${PATHS.BLOGS}?sortBy=name&sortDirection=asc`)
      .expect(HttpStatus.OK);

    const names = response.body.items.map((item: any) => item.name);
    expect(names).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('✅ should sort by createdAt descending by default', async () => {
    const blog1 = await createBlogUtil(app, { name: 'First' });
    const blog2 = await createBlogUtil(app, { name: 'Second' });
    const blog3 = await createBlogUtil(app, { name: 'Third' });

    const response = await request(app.getHttpServer())
      .get(PATHS.BLOGS)
      .expect(HttpStatus.OK);

    const ids = response.body.items.map((item: any) => item.id);

    expect(ids).toEqual([blog3.id, blog2.id, blog1.id]);
  });

});
