import { Response } from 'express';
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { DomainException } from "../domain-exceptions";
import { DomainExceptionCode } from "../domain-exception-codes";
import { APIErrorResult, FieldError } from "./error-response-body.type";


@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    console.log('DOMAIN FILTER:', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.mapToHttpStatus(exception.code);

    const responseBody = this.buildResponseBody(exception);

    response.status(status).json(responseBody);
  }


  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
      case DomainExceptionCode.ConfirmationCodeExpired:
      case DomainExceptionCode.EmailNotConfirmed:
      case DomainExceptionCode.PasswordRecoveryCodeExpired:
        return HttpStatus.BAD_REQUEST;

      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;

      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;

      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;

      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;

      default:
        const errorMessage = `Hey, champ! Are u winning to day?, add this code to DomainExceptionCode: ${code}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
  }

  private buildResponseBody(exception: DomainException): APIErrorResult {
    const errorsMessages: FieldError[] =
      exception.extensions.length > 0
        ? exception.extensions.map((e) => ({
          message: e.message,
          field: e.field,
        }))
        : [{ message: exception.message, field: null }]
    return { errorsMessages }
  }
}