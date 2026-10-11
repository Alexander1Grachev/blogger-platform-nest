import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';



@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    const trimmedVatue = typeof value === 'string' ? value.trim() : value;

    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid ObjectId: ${value}`,
      });
    }

    return value;
  }
}