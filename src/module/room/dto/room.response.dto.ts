import { Expose, Transform, Type } from 'class-transformer';
import { User } from 'src/module/user/schema/user.schema';

export class RoomResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  _id: string;

  @Expose()
  title: string;

  @Type(() => User)
  @Expose()
  users: User[];
}
