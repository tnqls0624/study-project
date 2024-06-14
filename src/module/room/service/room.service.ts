import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RoomRepository } from '../interface/room.repository';
import { CreateRoomRequestDto } from '../dto/create-room.request.dto';
import { Room } from '../schema/room.schema';
import { Types } from 'mongoose';
import { UserDto } from 'src/module/user/dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { RoomResponseDto } from '../dto/room.response.dto';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);
  constructor(
    @Inject('ROOM_REPOSITORY')
    private readonly roomRepository: RoomRepository,
  ) {}

  async create(
    user: UserDto,
    body: CreateRoomRequestDto,
  ): Promise<RoomResponseDto> {
    const room = await this.roomRepository.create(user, body);
    return plainToInstance(RoomResponseDto, room, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<RoomResponseDto[]> {
    const rooms = await this.roomRepository.findAll();
    return plainToInstance(RoomResponseDto, rooms, {
      excludeExtraneousValues: true,
    });
  }

  findById(_id: string): Promise<Room> {
    return this.roomRepository.findById(_id);
  }

  async join(_id: string, user_id: string): Promise<RoomResponseDto> {
    try {
      const room = await this.roomRepository.findById(_id);
      if (!room) throw new BadRequestException('Not Found Room');
      if (room.users.some((id) => id.equals(new Types.ObjectId(user_id))))
        throw new BadRequestException('User already in room');

      const join_room = await this.roomRepository.join(_id, user_id);
      return plainToInstance(RoomResponseDto, join_room, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e);
      return e;
    }
  }
}
