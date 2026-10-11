import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from './application/users.service';
import { AuthService } from './application/auth-service';
import { BcryptService } from './application/bcrypt.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { AuthController } from './api/auth.controller';
import { UsersController } from './api/users.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { User, UserSchema } from './domain/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),

    PassportModule,

    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('AC_SECRET'),

        signOptions: {
          expiresIn: Number(configService.getOrThrow<string>('AC_TIME')),
        },
      }),
    }),

    NotificationsModule,
  ],

  controllers: [UsersController, AuthController],

  providers: [
    UsersService,
    AuthService,
    BcryptService,
    UsersRepository,
    UsersQueryRepository,
    AuthQueryRepository,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class UserAccountsModule { }