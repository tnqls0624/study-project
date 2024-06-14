import { Injectable } from '@nestjs/common';
import { UserRepository } from '../interface/user.repository';
import { User } from '../schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { CreateUserRequestDto } from '../dto/create-user.request.dto';

@Injectable()
export class UserRepositoryImplement implements UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  insert(body: CreateUserRequestDto): Promise<User> {
    const user_model = new this.userModel(body);
    return user_model.save();
  }

  findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  findByUserId(user_id: string): Promise<User> {
    return this.userModel
      .findOne({
        user_id,
      })
      .exec();
  }

  findById(_id: Schema.Types.ObjectId): Promise<User> {
    return this.userModel.findById({ _id }).select('-password').exec();
  }
}
