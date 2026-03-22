import { Session } from '../entities/Session';

export interface ISessionRepository {
  saveSession(session: Session): Promise<Session>;
  findSessionByToken(token: string): Promise<Session | null>;
  deleteSession(sessionId: string): Promise<void>;
}
