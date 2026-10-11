import { INestApplication } from "@nestjs/common";
import { pipesSetup } from "./pipes.setup";
import { swaggerSetup } from "./swagger.setup";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";


export function appSetup(app: INestApplication): string {
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  const port = configService.getOrThrow<string>('PORT');

  pipesSetup(app);
  swaggerSetup(app);
  return port;
}