import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, MinLength } from 'class-validator';

export class CreateRoomRequestDto {
  @ApiProperty({
    example: '개발자 모집',
    description: '방이름',
  })
  @MaxLength(40)
  @MinLength(3)
  readonly title: string;
}
