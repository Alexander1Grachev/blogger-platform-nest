import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { appSetup } from 'src/setup/app.setup';

export async function getTestApp(): Promise<INestApplication> {
  // подключаемся к отдельной тестовой БД, чтобы не трогать dev-данные
  process.env.MONGO_URL =
    process.env.MONGO_URL_TEST ||
    'mongodb://localhost:27017/blogger-platform-project-test';

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  appSetup(app);
  await app.init(); // тут происходит подключение к MongoDB


  return app;
}