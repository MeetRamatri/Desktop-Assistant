import { ISessionRepository } from '../../domain/repositories/ISessionRepository';
import { Session } from '../../domain/entities/Session';
import { SessionModel } from '../database/models/SessionModel';

export class MongoSessionRepository implements ISessionRepository {
  async saveSession(session: Session): Promise<Session> {
    const newSession = new SessionModel({
      userId: session.userId,
      token: session.token,
      expiresAt: session.expiresAt
    });
    const saved = await newSession.save();
    return new Session(saved._id.toString(), saved.userId, saved.token, saved.createdAt, saved.expiresAt);
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    const doc = await SessionModel.findOne({ token });
    if (!doc) return null;
    return new Session(doc._id.toString(), doc.userId, doc.token, doc.createdAt, doc.expiresAt);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await SessionModel.findByIdAndDelete(sessionId);
  }
}
