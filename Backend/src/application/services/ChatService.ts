import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { IAIService } from '../interfaces/IAIService';
import { Conversation } from '../../domain/entities/Conversation';
import { Message } from '../../domain/entities/Message';
export class ChatService {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly aiService: IAIService
  ) { }
  async sendPrompt(userId: string, promptText: string, conversationId?: string): Promise<{ conversation: Conversation, aiResponse: string }> {
    let conversation: Conversation | null = null;
    if (!conversationId) {
      const newConversation = new Conversation("", userId, [], new Date());
      conversation = await this.conversationRepository.createConversation(newConversation);
      conversationId = conversation.conversationId;
    }
    const userMessage = new Message("", 'user', promptText, new Date());
    let updatedConversation = await this.conversationRepository.addMessageToConversation(conversationId!, userMessage);

    if (!updatedConversation) {
      throw new Error('Conversation tracking failed internally.');
    }

    const aiResponseText = await this.aiService.sendTextPrompt(promptText);

    const aiMessage = new Message("", 'ai', aiResponseText, new Date());
    updatedConversation = await this.conversationRepository.addMessageToConversation(conversationId!, aiMessage);

    if (!updatedConversation) {
      throw new Error('Failed to attach AI response to conversation.');
    }

    return { conversation: updatedConversation, aiResponse: aiResponseText };
  }
  async getChatHistory(userId: string): Promise<Conversation[]> {
    return await this.conversationRepository.getConversationsByUserId(userId);
  }
}
