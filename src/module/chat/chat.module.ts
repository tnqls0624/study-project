import { Module, Provider } from '@nestjs/common';
import { ChatController } from './controller/chat.controller';
import { ChatService } from './service/chat.service';
import { ChatRepositoryImplement } from './repository/chat.repository.implement';
import { Message, MessageSchema } from './schema/message.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './gateway/chat.gateway';

const infrastructure: Provider[] = [
  {
    provide: 'CHAT_REPOSITORY',
    useClass: ChatRepositoryImplement,
  },
];

const services = [ChatService, ChatGateway];

const controller = [ChatController];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [...controller],
  providers: [...services, ...infrastructure],
})
export class ChatModule {}
