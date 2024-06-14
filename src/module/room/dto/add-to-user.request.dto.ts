import { ApiProperty } from '@nestjs/swagger';

export class AddToUserRequestDto {
  @ApiProperty({
    example: 'dktnqls0624',
    description: '유저 아이디',
  })
  readonly user_id: string;
}
