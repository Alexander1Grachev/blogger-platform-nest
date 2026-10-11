import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, type UserModelType } from '../domain/user.entity';
import { DomainException, Extension } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { UserDomainErrors } from '../domain/user.errors';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) { }

  async save(newuser: UserDocument) {
    await newuser.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    return user;
  }

  async findByLoginOrEmailValues(
    dto: {
      login: string,
      email: string,
    }
  ): Promise<UserDocument[]> {
    return this.UserModel.find({
      $or: [
        { login: dto.login },
        { email: dto.email },
      ],
      deletedAt: null,
    });
  }

  async findByloginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [
        { login: loginOrEmail },
        { email: loginOrEmail }
      ],
      deletedAt: null,
    });
  }

  async findByConfirmationCodeOrNotFoundFail(
    code: string
  ): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
      deletedAt: null,
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: UserDomainErrors.INVALID_CODE,
        extensions: [new Extension(UserDomainErrors.INVALID_CODE, 'code')],
      });
    }
    return user;
  }

  async findByRecoveryCodeOrNotFoundFail(code: string): Promise<UserDocument> {

    const user = await this.UserModel.findOne({
      'passwordRecovery.recoveryCode': code,
      deletedAt: null,
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: UserDomainErrors.RECOVERY_CODE_INCORRECT,
        extensions: [new Extension(UserDomainErrors.RECOVERY_CODE_INCORRECT, 'recoveryCode')],
      });
    }
    return user;
  }

}

