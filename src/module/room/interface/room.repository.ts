import { CreateRoomRequestDto } from '../dto/create-room.request.dto';
import { Room } from '../schema/room.schema';
import { UserDto } from 'src/module/user/dto/user.dto';

export interface RoomRepository {
  create(user: UserDto, body: CreateRoomRequestDto): Promise<Room>;
  findAll(): Promise<Room[]>;
  findById(_id: string): Promise<Room>;
  join(_id: string, user_id: string): Promise<Room>;
}
