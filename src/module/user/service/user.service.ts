import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UserRepository } from '../interface/user.repository';
import { CreateUserRequestDto } from '../dto/create-user.request.dto';
import { PASSWORD_GENERATOR, PasswordGenerator } from 'src/lib/password.module';
import { LoginRequestDto } from '../dto/login.request.dto';
import { JwtService } from '@nestjs/jwt';
import { CACHE_GENERATOR } from 'src/lib/cache.module';
import { UserResponseDto } from '../dto/user.response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_GENERATOR)
    private readonly passwordGenerator: PasswordGenerator,
    @Inject(CACHE_GENERATOR) private readonly cacheGenerator: CACHE_GENERATOR,
    private readonly jwtService: JwtService,
  ) {}

  async create(body: CreateUserRequestDto): Promise<boolean> {
    try {
      const { user_id, password, name } = body;
      const hash = await this.passwordGenerator.generateHash(password);
      const user = await this.userRepository.findByUserId(user_id);

      if (user) throw new BadRequestException('Duplicated User ID');
      await this.userRepository.insert({
        user_id,
        password: hash,
        name,
      });
      return true;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e, e.status);
    }
  }

  async login(body: LoginRequestDto): Promise<string> {
    try {
      const { user_id, password } = body;

      const user = await this.userRepository.findByUserId(user_id);
      if (!user) throw new BadRequestException('Not Found User');
      const password_confirm = await this.passwordGenerator.confirmHash(
        password,
        user.password,
      );

      if (!password_confirm)
        throw new BadRequestException('Password Incorrect');
      const access_token = await this.jwtService.signAsync(
        {
          _id: user._id,
        },
        {
          secret: process.env.JWT_ACCESS_TOKEN_SECRET,
          expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        },
      );
      await this.cacheGenerator.setCache(`token:${user._id}`, access_token, 0);
      return access_token;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e, e.status);
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    try {
      const users = await this.userRepository.findAll();
      return plainToInstance(UserResponseDto, users, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e, e.status);
    }
  }
}
