export class Session {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly token: string,
    public readonly createdAt: Date,
    public readonly expiresAt: Date
  ) { }
}
