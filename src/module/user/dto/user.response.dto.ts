import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  readonly name: string;

  @Expose()
  readonly _id: string;
}
