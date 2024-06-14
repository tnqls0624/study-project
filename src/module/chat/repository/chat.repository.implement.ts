import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../interface/chat.repository';
import { Message, MessageDocument } from '../schema/message.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Message as MessageType } from '../controller/chat.controller';

@Injectable()
export class ChatRepositoryImplement implements ChatRepository {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  create(data: MessageType): Promise<Message> {
    const message = new this.messageModel({
      content: data.content,
      user: new mongoose.Types.ObjectId(data.user),
      room: new mongoose.Types.ObjectId(data.room),
    });
    return message.save();
  }

  findMessageByRoomId(_id: string): Promise<Message[]> {
    return this.messageModel
      .find({ room: new mongoose.Types.ObjectId(_id) })
      .populate('user')
      .exec();
  }
}
