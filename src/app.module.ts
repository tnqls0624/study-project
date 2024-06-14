import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ChatModule } from './module/chat/chat.module';
import { RoomModule } from './module/room/room.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'CHAT_SERVICE',
        transport: Transport.MQTT,
        options: {
          url: `${process.env.MQTT_PROTOCOL}://${process.env.MQTT_URL}`,
        },
      },
    ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService): Promise<any> => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<string>('REDIS_PORT'),
        ttl: configService.get<string>('REDIS_EXPIRED_AT'),
      }),
    }),
    UserModule,
    MongooseModule.forRoot(process.env.MONGO_URL),
    ChatModule,
    RoomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
