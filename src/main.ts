import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SuccessInterceptor } from './interceptor/success.interceptor';
import { RedisIoAdapter } from './adapter/redis.adaptor';

export const configService = new ConfigService();
export const logger = new Logger('MQTT TEST');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisIoAdapter = await connectRedis(app);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new SuccessInterceptor());

  app.connectMicroservice({
    transport: Transport.MQTT,
    options: {
      protocol: process.env.MQTT_PROTOCOL,
      url: `${process.env.MQTT_PROTOCOL}://${process.env.MQTT_URL}`,
    },
  });
  app.useWebSocketAdapter(redisIoAdapter);

  const config = new DocumentBuilder()
    .setTitle('Chat Practice API Document')
    .setDescription('API 문서입니다')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'authorization',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}

async function connectRedis(app: INestApplication): Promise<RedisIoAdapter> {
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  return redisIoAdapter;
}

bootstrap();
