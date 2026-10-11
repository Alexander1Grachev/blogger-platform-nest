import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { APIErrorResult } from './error-response-body.type';

@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isProduction = process.env.NODE_ENV === 'production';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isProduction
      ? status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Some error occurred'
        : exception.message
      : exception.message || 'Unknown exception occurred.';

    const responseBody: APIErrorResult = {
      errorsMessages: [{ message, field: null }],
    };

    response.status(status).json(responseBody);
  }
}