import { User } from '../entities/User';

export class UserFactory {
  static create(email: string, passwordHash: string): User {
    return new User("", email, passwordHash, new Date());
  }
}
