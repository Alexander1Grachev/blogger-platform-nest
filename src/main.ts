
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = appSetup(app);

  await app.listen(port, () => {
    console.log('Server is running on port ' + port);
  });
}
bootstrap();