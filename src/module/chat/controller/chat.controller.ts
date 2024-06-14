import { Controller, Get, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ChatService } from '../service/chat.service';

export type Message = {
  content: string;
  user: string;
  room: string;
};

@ApiTags('CHAT')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern('message:save')
  async create(@Payload() data: Message) {
    await this.chatService.create(data);
  }

  @ApiOperation({ summary: 'Find Room Message' })
  @ApiParam({
    name: '_id',
    required: true,
    description: '방 아이디',
    type: 'string',
  })
  @Get('/room/:_id/find-message')
  async findRoomMessage(@Param('_id') _id: string) {
    return this.chatService.findRoomMessage(_id);
  }
}
