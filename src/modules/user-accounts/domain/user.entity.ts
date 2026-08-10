import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { CreateUserDomainDto } from "./dto/create-user.domain.dto";

@Schema({ timestamps: true })
export class User {
    _id: Types.ObjectId;


    @Prop({ type: String, required: true })
    login: string;
    @Prop({ type: String, required: true })
    email: string;
    @Prop({ type: String, required: true })
    passwordHash: string;

    @Prop({ type: Date, default: null })
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    static createInstance(dto: CreateUserDomainDto): UserDocument {
        const user = new this();
        user.email = dto.email;
        user.login = dto.login;
        user.passwordHash = dto.passwordHash;
        return user as UserDocument;
    }
    get id() {
        return this._id.toString();
    }
    makeDeleted() {
        if (this.deletedAt !== null) {
            throw new Error('Entity already deleted');
        }
        this.deletedAt = new Date();
    }

}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;