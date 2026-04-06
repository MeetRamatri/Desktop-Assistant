import { Session } from '../entities/Session';
import crypto from 'crypto';

export class SessionFactory {
  static create(userId: string): Session {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    return new Session("", userId, token, new Date(), expiresAt);
  }
}
