import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { AppTestingModule } from './modules/testing/testing.module';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
  ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10_000,
          limit: 5,
        },
      ],
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URL'),
      }),
    }),
    UserAccountsModule,
    BloggersPlatformModule,
    AppTestingModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter, // catch-all fallback
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter, // обрабатывает DomainException
    },
  ],
})
export class AppModule { }
