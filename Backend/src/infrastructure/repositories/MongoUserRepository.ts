import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserModel } from '../database/models/UserModel';

export class MongoUserRepository implements IUserRepository {

  async saveUser(user: User): Promise<User> {
    if (user.userId) {
      const existing = await UserModel.findById(user.userId);
      if (existing) {
        existing.email = user.email;
        existing.passwordHash = user.passwordHash;
        const updated = await existing.save();
        return new User(updated._id.toString(), updated.email, updated.passwordHash, updated.createdAt);
      }
    }
    const newUser = new UserModel({
      email: user.email,
      passwordHash: user.passwordHash
    });

    const saved = await newUser.save();
    return new User(saved._id.toString(), saved.email, saved.passwordHash, saved.createdAt);
  }

  async findUserById(userId: string): Promise<User | null> {
    const doc = await UserModel.findById(userId);
    if (!doc) return null;
    return new User(doc._id.toString(), doc.email, doc.passwordHash, doc.createdAt);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase().trim() });

    if (!doc) {
      return null;
    }

    return new User(doc._id.toString(), doc.email, doc.passwordHash, doc.createdAt);
  }
}
