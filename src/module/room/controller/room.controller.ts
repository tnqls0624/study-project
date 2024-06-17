import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RoomService } from '../service/room.service';
import { CreateRoomRequestDto } from '../dto/create-room.request.dto';
import { JwtAuthGuard } from 'src/module/user/guard';
import { User } from 'src/common/decorator/user.decorator';
import { UserDto } from 'src/module/user/dto/user.dto';

@ApiTags('ROOM')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @ApiOperation({ summary: 'Create a Room' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/create-room')
  async create(@User() user: UserDto, @Body() body: CreateRoomRequestDto) {
    return this.roomService.create(user, body);
  }

  @ApiOperation({ summary: 'Find All Room' })
  @Get('/find-all')
  async findAll() {
    return this.roomService.findAll();
  }

  @ApiOperation({ summary: 'Find My Room' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/my')
  async findMy(@User() user: UserDto) {
    return this.roomService.findMyRoom(user._id);
  }

  @ApiOperation({ summary: 'Join Room' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: '_id',
    required: true,
    description: '방 아이디',
    type: 'string',
  })
  @Get('/:_id/join')
  async join(@User() user: UserDto, @Param('_id') room_id: string) {
    return this.roomService.join(room_id, user._id);
  }
}
