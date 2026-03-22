import { User } from '../entities/User';
export interface IUserRepository {
  saveUser(user: User): Promise<User>;
  findUserById(userId: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
}
