import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { CommentatorInfoDto } from "../api/view-dto/comments.view-dto";
import { CommentatorInfoSchema } from "./commentatorInfo.schema";



@Schema({ timestamps: true })
export class Comment {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfoDto;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  get id() {
    return this._id.toString();
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModeltype = Model<CommentDocument> & typeof Comment;