export class User {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date
  ) { }
}
