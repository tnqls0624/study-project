import { Inject, Injectable } from '@nestjs/common';
import { ChatRepository } from '../interface/chat.repository';
import { Message } from '../controller/chat.controller';

import { RoomMessageResponseDto } from '../dto/room-message.response.dto';
import { plainToInstance } from 'class-transformer';
import mongoose from 'mongoose';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class ChatService {
  private client: ClientProxy;
  constructor(
    @Inject('CHAT_REPOSITORY')
    private readonly chatRepository: ChatRepository,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.MQTT,
      options: {
        url: 'mqtt://localhost:1883', // MQTT 브로커 URL
      },
    });
  }

  async mqttMessageSend(data: Message): Promise<boolean> {
    const message_data = {
      room: new mongoose.Types.ObjectId(data.room),
      user: new mongoose.Types.ObjectId(data.user),
      content: data.content,
    };
    this.client.emit('message:save', message_data);
    return true;
  }

  async create(data: Message) {
    await this.chatRepository.create(data);
  }

  async findRoomMessage(_id: string): Promise<RoomMessageResponseDto[]> {
    const messages = await this.chatRepository.findMessageByRoomId(_id);
    return plainToInstance(RoomMessageResponseDto, messages, {
      excludeExtraneousValues: true,
    });
  }
}
