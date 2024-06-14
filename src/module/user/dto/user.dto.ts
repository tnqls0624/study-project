import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  readonly _id: string;

  @Expose()
  readonly name: string;
}
