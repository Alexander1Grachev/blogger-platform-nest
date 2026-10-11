import { Injectable } from '@nestjs/common';
import { BcryptService } from 'src/modules/user-accounts/application/bcrypt.service';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { add } from 'date-fns';
import { DomainException, Extension } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectModel } from '@nestjs/mongoose';
import { User, } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { EmailService } from 'src/modules/notifications/email.service';
import { emailTemplates } from 'src/modules/notifications/emails.templates';
import { JwtService } from '@nestjs/jwt';
import { UserDomainErrors } from '../domain/user.errors';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private emailService: EmailService,
  ) { }
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByloginOrEmail(loginOrEmail);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.bcryptService.checkPassword(
      password,
      user.passwordHashValue,
    );

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
    };
  }


  async login(userId: string) {
    const accessToken = this.jwtService.sign({ id: userId } as UserContextDto);
    return {
      accessToken,
    };
  }

  async registerUser(dto: CreateUserDto): Promise<void> {

    const users = await this.usersRepository.findByLoginOrEmailValues({
      login: dto.login,
      email: dto.email
    })


    for (const user of users) {
      if (user.loginValue === dto.login) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'Login is already in use',
          extensions: [
            new Extension('Login is already in use', 'login'),
          ],
        });
      }

      if (user.emailValue === dto.email) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'Email is already in use',
          extensions: [
            new Extension('Email is already in use', 'email'),
          ],
        });
      }
    }

    const passwordHash = await this.bcryptService.generateHash(dto.password);

    const user = this.UserModel.createInstanceWithConfirmation({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });

    await this.usersRepository.save(user);
    const confirmCode = user.confirmationCode!;

    const html = emailTemplates.registrationEmail(confirmCode, user.loginValue);

    this.emailService
      .sendEmail(
        user.emailValue,
        confirmCode,
        html
      )
      .catch(console.error);
  }

  async confirmEmail(code: string): Promise<void> {
    const user = await this.usersRepository.findByConfirmationCodeOrNotFoundFail(code);
    user.confirmEmail(code);
    await this.usersRepository.save(user);
  }

  async resendConfirmationCode(email: string): Promise<void> {
    const user = await this.usersRepository.findByloginOrEmail(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email not found',
        extensions: [new Extension('Email not found', 'email')],
      });
    }

    if (user.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: UserDomainErrors.ALREADY_CONFIRMED,
        extensions: [new Extension(UserDomainErrors.ALREADY_CONFIRMED, 'email')], 
      });
    }
    const code = crypto.randomUUID();
    const expiration = add(new Date(), { hours: 48 });

    user.setConfirmationCode(code, expiration); // через Entity
    await this.usersRepository.save(user);


    const html = emailTemplates.registrationEmail(code, user.loginValue);
    this.emailService.sendEmail(
      user.emailValue,
      code,
      html,
    ).catch(console.error);
  }

  async passwordRecovery(email: string): Promise<void> {
    const user = await this.usersRepository.findByloginOrEmail(email);

    if (!user) {
      return; // молча выходим — не палим почты, контроллер вернёт 204
    }

    const recoveryCode = crypto.randomUUID();
    const expirationDate = add(new Date(), { hours: 1 });

    user.setPasswordRecoveryCode(recoveryCode, expirationDate);
    await this.usersRepository.save(user);

    const html = emailTemplates.recoveryPasswordEmail(recoveryCode)
    this.emailService
      .sendEmail(user.emailValue, recoveryCode, html)
      .catch(console.error);
  }

  async setNewPassword(dto: {
    newPassword: string,
    recoveryCode: string
  }): Promise<void> {

    const user = await this.usersRepository.findByRecoveryCodeOrNotFoundFail(
      dto.recoveryCode,
    );

    const newPasswordHash = await this.bcryptService.generateHash(dto.newPassword);
    user.updatePassword(newPasswordHash, dto.recoveryCode);

    await this.usersRepository.save(user);
  }

}


