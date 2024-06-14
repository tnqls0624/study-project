import { Injectable } from '@nestjs/common';
import { Room, RoomDocument } from '../schema/room.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RoomRepository } from '../interface/room.repository';
import { CreateRoomRequestDto } from '../dto/create-room.request.dto';
import { UserDto } from 'src/module/user/dto/user.dto';

@Injectable()
export class RoomRepositoryImplement implements RoomRepository {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  create(user: UserDto, body: CreateRoomRequestDto): Promise<Room> {
    const { title } = body;
    const { _id } = user;
    const createdRoom = new this.roomModel({ title, users: _id });
    return createdRoom.save();
  }

  findAll(): Promise<Room[]> {
    return this.roomModel.find().populate('users').exec();
  }

  findById(_id: string): Promise<Room> {
    return this.roomModel.findById(_id).populate('users').exec();
  }

  join(room_id: string, user_id: string): Promise<Room> {
    return this.roomModel
      .findByIdAndUpdate(room_id, { $push: { users: user_id } }, { new: true })
      .populate('users')
      .exec();
  }
}
