import { injectable } from 'inversify';
import { User, IUser } from '../models/user.model';

export interface IUserRepository {
  create(userData: Partial<IUser>): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  update(id: string, userData: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}

@injectable()
export class UserRepository implements IUserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password') as Promise<IUser | null>;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username });
  }

  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    const result = await User.findByIdAndUpdate(id, userData, { new: true }).select('-password');
    return result as IUser | null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return result !== null;
  }
}
