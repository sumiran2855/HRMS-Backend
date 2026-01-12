import { injectable } from 'inversify';
import bcrypt from 'bcryptjs';
import { envConfig } from '../../config/env.config';

export interface IPasswordService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}

@injectable()
export class PasswordService implements IPasswordService {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(envConfig.bcryptRounds);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
