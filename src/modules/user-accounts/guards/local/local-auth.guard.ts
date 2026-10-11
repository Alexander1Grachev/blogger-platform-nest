import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";
import { DomainException, Extension } from "src/core/exceptions/domain-exceptions";
import { Request } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    const { loginOrEmail, password } = request.body;

    const extensions: Extension[] = [];

    if (!loginOrEmail) {
      extensions.push(
        new Extension(
          'Login or email is required',
          'loginOrEmail',
        ),
      );
    }

    if (!password) {
      extensions.push(
        new Extension(
          'Password is required',
          'password',
        ),
      );
    }

    if (extensions.length > 0) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Validation failed',
        extensions,
      });
    }

    return super.canActivate(context);
  }
}