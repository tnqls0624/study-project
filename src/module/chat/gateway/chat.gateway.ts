import { Inject, Logger } from '@nestjs/common';
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
import { CACHE_GENERATOR } from 'src/lib/cache.module';
import { RoomService } from 'src/module/room/service/room.service';

export enum Action {
  CONNECT = 'CONNECT',
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
  DISCONNECT = 'DISCONNECT',
  SEND_MESSAGE = 'SEND_MESSAGE',
}

export interface ConnectAction {
  _id: string;
}

export interface JoinRoomAction {
  room: string;
  user: string;
}

export interface LeaveRoomAction {
  room: string;
  user: string;
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
  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
    @Inject(CACHE_GENERATOR) private readonly cacheGenerator: CACHE_GENERATOR,
  ) {}
  private logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log(`Socket Server Init Complete`);
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    client.emit('connect-message', `${client.id}`);
    this.logger.log(`${client.id}가 연결되었습니다`);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`${client.id}님이 연결이 끊겼습니다`);

    const _id = (await this.cacheGenerator.getCache(
      `SOCKET:${client.id}`,
    )) as string;
    await this.cacheGenerator.delCache(`SOCKET:${client.id}`);
    const room = await this.roomService.findMyRoom(_id);
    const room_id = String(room._id);
    const disconnect_data = {
      type: Action.DISCONNECT,
      socket: client.id,
      room: room_id,
      user: _id,
    };

    this.server.to(String(room._id)).emit('receive-message', disconnect_data);
    await this.roomService.leave(room_id, _id);
  }

  @SubscribeMessage('connecting')
  async connectEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ConnectAction,
  ): Promise<void> {
    const connect_data = {
      type: Action.CONNECT,
      socket: client.id,
      _id: data._id,
    };
    client.emit('receive-message', connect_data);

    await this.cacheGenerator.setCache(`SOCKET:${client.id}`, data._id, 0);
    this.logger.log(`SOCKET:${client.id} Connect`);
  }

  @SubscribeMessage('join-room')
  async joinRoomEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomAction,
  ): Promise<void> {
    const join_data = {
      type: Action.JOIN,
      room: data.room,
      user: data.user,
      socket: client.id,
    };

    client.join(data.room);
    this.server.to(data.room).emit('receive-message', join_data);
    this.logger.log(`${client.id}님이 ${data.room} 방에 입장 했습니다.`);
  }

  @SubscribeMessage('leave-room')
  async leaveRoomEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: LeaveRoomAction,
  ): Promise<void> {
    const leave_data = {
      type: Action.LEAVE,
      room: data.room,
      user: data.user,
      socket: client.id,
    };

    client.leave(data.room);
    this.server.to(data.room).emit('receive-message', leave_data);
    this.logger.log(`${client.id}님이 ${data.room} 방에 퇴장 했습니다.`);
  }

  @SubscribeMessage('send-message')
  async sendMessageEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageAction,
  ): Promise<void> {
    const message_data = {
      type: Action.SEND_MESSAGE,
      room: data.room,
      user: data.user,
      socket: client.id,
      content: data.content,
    };
    this.server.to(data.room).emit('receive-message', message_data);
    this.chatService.mqttMessageSend(data);
    this.logger.debug(`${data.content}`);
  }
}
