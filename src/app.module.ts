import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { AppTestingModule } from './modules/testing/testing.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.MONGO_URL ||
          'mongodb://localhost:27017/blogger-platform',
      }),
    }),
    UserAccountsModule,
    BloggersPlatformModule,
    AppTestingModule
  ],
})
export class AppModule { }
