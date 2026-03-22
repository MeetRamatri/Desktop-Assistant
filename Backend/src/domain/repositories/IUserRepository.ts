import { User } from '../entities/User';
export interface IUserRepository {
  saveUser(user: User): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
}
