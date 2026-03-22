import { Conversation } from '../entities/Conversation';
import { Message } from '../entities/Message';

export interface IConversationRepository {
  createConversation(conversation: Conversation): Promise<Conversation>;
  getConversationsByUserId(userId: string): Promise<Conversation[]>;
  addMessageToConversation(conversationId: string, message: Message): Promise<Conversation | null>;
}
