import { Message } from './Message';

export class Conversation {
  constructor(
    public readonly conversationId: string,
    public readonly userId: string,
    public readonly messages: Message[],
    public readonly createdAt: Date
  ) { }
}
