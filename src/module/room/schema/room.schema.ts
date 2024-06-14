import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type RoomDocument = Room & Document<Types.ObjectId>;

@Schema({
  timestamps: true,
  collection: 'rooms',
})
export class Room {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  users: Types.ObjectId[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
