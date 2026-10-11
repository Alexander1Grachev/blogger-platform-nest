import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;


    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorised',
      });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8',
    );
    const [username, password] = credentials.split(':');
    const validUsername =
      this.configService.getOrThrow<string>('BASIC_AUTH_USERNAME');

    const validPassword =
      this.configService.getOrThrow<string>('BASIC_AUTH_PASSWORD');

    if (
      username === validUsername &&
      password === validPassword
    ) {
      return true;
    } else {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorised',
      });
    }
  }
}