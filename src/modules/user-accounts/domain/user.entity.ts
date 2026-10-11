import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { CreateUserDomainDto } from "./dto/create-user.domain.dto";
import { add } from 'date-fns';
import { EmailConfirmation, EmailConfirmationSchema } from "./emailConfirmation.schema";
import { DomainException, Extension } from "src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";
import { PasswordRecovery, PasswordRecoverySchema } from "./passwordRecovery.schema";
import { UserDomainErrors } from "./user.errors";
import { CommonDomainErrors } from "src/core/exceptions/common-domain-errors";




@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;


  @Prop({ type: String, required: true, unique: true })
  private login: string;
  @Prop({ type: String, required: true, unique: true })
  private email: string;
  @Prop({ type: String, required: true })
  private passwordHash: string;

  @Prop({ type: EmailConfirmationSchema, required: true })
  private emailConfirmation: EmailConfirmation;

  @Prop({ type: PasswordRecoverySchema, default: null })
  private passwordRecovery: PasswordRecovery | null;

  @Prop({ type: Date, default: null })
  private deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;


  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.email = dto.email;
    user.login = dto.login;
    user.passwordHash = dto.passwordHash;

    user.emailConfirmation = {
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: true,
    };

    return user as UserDocument;
  }

  static createInstanceWithConfirmation(
    dto: CreateUserDomainDto,
  ): UserDocument {
    const user = this.createInstance(dto);

    user.emailConfirmation.isConfirmed = false;

    user.setConfirmationCode(crypto.randomUUID(), add(new Date(), { hours: 48 }));
    return user;
  }

  setConfirmationCode(code: string, expirationDate: Date) {
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: UserDomainErrors.ALREADY_CONFIRMED,
        extensions: [new Extension(UserDomainErrors.ALREADY_CONFIRMED, 'code')],
      })
    }
    this.emailConfirmation.confirmationCode = code;
    this.emailConfirmation.expirationDate = expirationDate;
  }

  confirmEmail(code: string) {
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: UserDomainErrors.ALREADY_CONFIRMED,
        extensions: [new Extension(UserDomainErrors.ALREADY_CONFIRMED, 'code')],
      });
    }
    if (this.emailConfirmation.confirmationCode !== code) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: UserDomainErrors.INVALID_CODE,
        extensions: [new Extension(UserDomainErrors.INVALID_CODE, 'code')],
      });
    }
    if (
      this.emailConfirmation.expirationDate &&
      this.emailConfirmation.expirationDate < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code expired',
        extensions: [new Extension('Confirmation code expired', 'code')],
      });
    }
    this.emailConfirmation.isConfirmed = true;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: CommonDomainErrors.ALREADY_DELETED,
      });
    }
    this.deletedAt = new Date();
  }

  setPasswordRecoveryCode(code: string, expirationDate: Date) {
    this.passwordRecovery = {
      recoveryCode: code,
      expirationDate,
    };
  }
  updatePassword(newPasswordHash: string, recoveryCode: string) {
    if (!this.passwordRecovery || !this.passwordRecovery.recoveryCode) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: UserDomainErrors.RECOVERY_NOT_REQUESTED,
        extensions: [new Extension(UserDomainErrors.RECOVERY_NOT_REQUESTED, 'recoveryCode')],
      });
    }
    if (this.passwordRecovery.recoveryCode !== recoveryCode) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: UserDomainErrors.RECOVERY_CODE_INCORRECT,
        extensions: [new Extension(UserDomainErrors.RECOVERY_CODE_INCORRECT, 'recoveryCode')],
      });
    }
    if (
      this.passwordRecovery.expirationDate &&
      this.passwordRecovery.expirationDate < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: UserDomainErrors.RECOVERY_CODE_EXPIRED,
        extensions: [new Extension(UserDomainErrors.RECOVERY_CODE_EXPIRED, 'recoveryCode')],
      });
    }

    this.passwordHash = newPasswordHash;
    this.passwordRecovery = null;
  }

  // Геттеры
  get id() {
    return this._id.toString();
  }

  get loginValue(): string {
    return this.login;
  }

  get emailValue(): string {
    return this.email;
  }

  get passwordHashValue(): string {
    return this.passwordHash;
  }

  get confirmationCode(): string | null {
    return this.emailConfirmation.confirmationCode;
  }

  get isEmailConfirmed(): boolean {
    return this.emailConfirmation.isConfirmed;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

}


export const UserSchema = SchemaFactory.createForClass(User);

// TTL: удаляем только неподтверждённых по истечении срока
UserSchema.index(
  { 'emailConfirmation.expirationDate': 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { 'emailConfirmation.isConfirmed': false },
  },
);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;