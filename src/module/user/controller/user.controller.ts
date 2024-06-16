import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserRequestDto } from '../dto/create-user.request.dto';
import { UserService } from '../service/user.service';
import { JwtAuthGuard } from '../guard';
import { LoginRequestDto } from '../dto/login.request.dto';
import { User } from 'src/common/decorator/user.decorator';
import { UserResponseDto } from '../dto/user.response.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '../dto/user.dto';

@ApiTags('USER')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @ApiOperation({ summary: 'Create a User' })
  @Post('/sign-up')
  async create(@Body() body: CreateUserRequestDto) {
    return this.userService.create(body);
  }

  @ApiOperation({ summary: 'Find All User' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/find-all')
  async findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Login' })
  @Post('/login')
  async login(@Body() body: LoginRequestDto) {
    return this.userService.login(body);
  }

  @ApiOperation({ summary: 'Find My Info' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/find-info')
  findMe(@User() user: UserDto) {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  //   @MessagePattern('notifications')
  //   getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  //     console.log(`Topic: ${context.getTopic()}`);
  //   }
}
