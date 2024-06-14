import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type MessageDocument = Message & Document<Types.ObjectId>;

@Schema({
  timestamps: true,
  collection: 'messages',
})
export class Message {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Room' })
  room: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
