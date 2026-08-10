import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, type UserModelType } from '../domain/user.entity';

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
            //TODO: replace with domain exception
            throw new NotFoundException('user not found');
        }

        return user;
    }
}

