import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../service/chat.service';

export interface JoinRoomAction {
  room: string;
}

export interface SendMessageAction {
  room: string;
  user: string;
  content: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket'],
  namespace: /\/ws-.+/,
  allowEIO3: true,
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}
  private logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log(`Socket Server Init Complete`);
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    client.emit('connect-message', `${client.id}`);
    this.logger.log(`${client.id}가 연결되었습니다`);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`${client.id}가 연결이 끊겼습니다`);
  }

  @SubscribeMessage('join-room')
  async joinRoomEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomAction,
  ) {
    this.logger.log(`${data.room} 에 입장~`);
    client.join(`${data.room}`);
    client.emit('join-room', `{${data.room} 에 입장~`);
  }

  @SubscribeMessage('leave-room')
  async leaveRoomEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomAction,
  ) {
    client.leave(data.room);
    client.emit('leave-room', `${data.room} 에 퇴장`);
    this.logger.log(`${data.room} 에 퇴장`);
  }

  @SubscribeMessage('send-message')
  async sendMessageEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageAction,
  ) {
    this.server.to(`${data.room}`).emit('receive-message', data.content);
    this.chatService.mqttMessageSend(data);
    this.logger.debug(`${data.content}`);
  }
}
