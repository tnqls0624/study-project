import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document<Types.ObjectId>;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  _id: MongooseSchema.Types.ObjectId;

  @Expose()
  @Prop({ required: true, type: String, unique: true })
  user_id: string;

  @Prop({ required: true, type: String })
  password: string;

  @Expose()
  @Prop({ required: true, type: String })
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
