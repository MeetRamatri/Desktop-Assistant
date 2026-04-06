import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ISessionRepository } from '../../domain/repositories/ISessionRepository';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';
import { User } from '../../domain/entities/User';
import { UserFactory } from '../../domain/factories/UserFactory';
import { SessionFactory } from '../../domain/factories/SessionFactory';
import crypto from 'crypto';

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly passwordHasher: IPasswordHasher
  ) { }

  async register(email: string, passwordRaw: string): Promise<User> {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email address.');
    }

    const hashed = await this.passwordHasher.hash(passwordRaw);

    const newUser = UserFactory.create(email, hashed);
    return await this.userRepository.saveUser(newUser);
  }

  async login(email: string, passwordRaw: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid authentication credentials.');
    }

    const isMatch = await this.passwordHasher.compare(passwordRaw, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid authentication credentials.');
    }

    const sessionToSave = SessionFactory.create(user.userId);
    await this.sessionRepository.saveSession(sessionToSave);

    return { user, token: sessionToSave.token };
  }

  async logout(token: string): Promise<void> {
    const session = await this.sessionRepository.findSessionByToken(token);
    if (session) {
      await this.sessionRepository.deleteSession(session.sessionId);
    }
  }

  async validateSession(token: string): Promise<User | null> {
    const session = await this.sessionRepository.findSessionByToken(token);
    if (!session) return null;

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.deleteSession(session.sessionId);
      return null;
    }

    const user = await this.userRepository.findUserById(session.userId);
    return user;
  }
}
