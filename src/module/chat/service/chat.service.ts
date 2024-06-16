import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ChatService.name);
  private client: ClientProxy;
  constructor(
    @Inject('CHAT_REPOSITORY')
    private readonly chatRepository: ChatRepository,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.MQTT,
      options: {
        url: `${process.env.MQTT_PROTOCOL}://localhost:1883`, // MQTT 브로커 URL
      },
    });
  }

  mqttMessageSend(data: Message): boolean {
    try {
      const message_data = {
        room: new mongoose.Types.ObjectId(data.room),
        user: new mongoose.Types.ObjectId(data.user),
        content: data.content,
      };
      this.client.emit('message:save', message_data);
      return true;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e, e.status);
    }
  }

  async create(data: Message) {
    try {
      await this.chatRepository.create(data);
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e, e.status);
    }
  }

  async findRoomMessage(_id: string): Promise<RoomMessageResponseDto[]> {
    try {
      const messages = await this.chatRepository.findMessageByRoomId(_id);
      return plainToInstance(RoomMessageResponseDto, messages, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e, e.status);
    }
  }
}
