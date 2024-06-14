import { Message } from '../schema/message.schema';

export interface ChatRepository {
  create(data: object): Promise<Message>;
  findMessageByRoomId(_id: string): Promise<Message[]>;
}
