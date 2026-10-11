import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { User, type UserModelType } from '../domain/user.entity';
import { BcryptService } from 'src/modules/user-accounts/application/bcrypt.service';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { DomainException, Extension } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) { }
  async createUser(dto: CreateUserDto): Promise<string> {
    const users = await this.usersRepository.findByLoginOrEmailValues({
      login: dto.login,
      email: dto.email,
    });

    for (const user of users) {
      if (user.loginValue === dto.login) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'Login is already in use',
          extensions: [new Extension('Login is already in use', 'login')],
        });
      }
      if (user.emailValue === dto.email) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'Email is already in use',
          extensions: [new Extension('Email is already in use', 'email')],
        });
      }
    }
    const passwordHash = await this.bcryptService.generateHash(dto.password);

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    });

    await this.usersRepository.save(user);
    return user.id;
  }
  async delete(id: string): Promise<void> {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();
    await this.usersRepository.save(user);
  }

}
