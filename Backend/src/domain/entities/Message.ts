
export class Message {
  constructor(
    public readonly messageId: string,
    public readonly sender: 'user' | 'ai',
    public readonly content: string,
    public readonly timestamp: Date
  ) { }
}
