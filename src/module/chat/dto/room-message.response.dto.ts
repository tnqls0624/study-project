import { Expose, Transform, Type } from 'class-transformer';
import { User } from 'src/module/user/schema/user.schema';

export class RoomMessageResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  _id: string;

  @Expose()
  content: string;

  @Type(() => User)
  @Expose()
  user: User;
}
