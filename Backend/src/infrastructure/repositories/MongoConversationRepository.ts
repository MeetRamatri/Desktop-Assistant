import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { Conversation } from '../../domain/entities/Conversation';
import { Message } from '../../domain/entities/Message';
import { ConversationModel } from '../database/models/ConversationModel';

export class MongoConversationRepository implements IConversationRepository {
  async createConversation(conversation: Conversation): Promise<Conversation> {
    const newDoc = new ConversationModel({
      userId: conversation.userId,
      messages: conversation.messages.map(m => ({
        sender: m.sender,
        content: m.content,
        timestamp: m.timestamp
      }))
    });

    const saved = await newDoc.save();
    return this.mapToDomain(saved);
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    const docs = await ConversationModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map(doc => this.mapToDomain(doc));
  }

  async addMessageToConversation(conversationId: string, message: Message): Promise<Conversation | null> {
    const updated = await ConversationModel.findByIdAndUpdate(
      conversationId,
      {
        $push: {
          messages: {
            sender: message.sender,
            content: message.content,
            timestamp: message.timestamp
          }
        }
      },
      { new: true }
    );

    if (!updated) return null;
    return this.mapToDomain(updated);
  }
  private mapToDomain(doc: any): Conversation {
    const messages = doc.messages.map((m: any) => new Message(
      m._id.toString(),
      m.sender,
      m.content,
      m.timestamp
    ));

    return new Conversation(
      doc._id.toString(),
      doc.userId,
      messages,
      doc.createdAt
    );
  }
}
