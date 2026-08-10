import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { User, type UserModelType } from '../domain/user.entity';
import { BcryptService } from 'src/core/adapters/bcrypt.service';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) { }
  async create(dto: CreateUserDto): Promise<string> {
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
