import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../application/interfaces/IPasswordHasher';

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  async hash(plaintext: string): Promise<string> {
    return await bcrypt.hash(plaintext, this.saltRounds);
  }

  async compare(plaintext: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plaintext, hash);
  }
}
