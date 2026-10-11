import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';

import { UserContextDto } from '../dto/user-context.dto';
import { AuthService } from '../../application/auth-service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
  ) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto> {
    const user = await this.authService.validateUser(
      loginOrEmail,
      password,
    );

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid username or password',
      });
    }

    return user;
  }
}