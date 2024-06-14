import { Module, Provider } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { UserRepositoryImplement } from './repository/user.repository.implement';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { PasswordModule } from 'src/lib/password.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from 'src/lib/cache.module';

const infrastructure: Provider[] = [
  {
    provide: 'USER_REPOSITORY',
    useClass: UserRepositoryImplement,
  },
];

const services = [UserService, JwtStrategy, JwtService];

const controller = [UserController];

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<any> => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET') as string,
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          ) as string,
        },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PasswordModule,
    CacheModule,
  ],
  controllers: [...controller],
  providers: [...services, ...infrastructure],
})
export class UserModule {}
