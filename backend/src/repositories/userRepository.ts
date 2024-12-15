import { Types } from 'mongoose';
import { User, IUser } from '../models/User';

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email }).select('+password');
}

export async function findUserByUsername(username: string): Promise<IUser | null> {
  return User.findOne({ username });
}

export async function createUser(username: string, email: string, hashedPassword: string): Promise<IUser> {
  const user = new User({ username, email, password: hashedPassword });
  return user.save();
}

export async function findUserById(userId: string | Types.ObjectId): Promise<IUser | null> {
  return User.findById(userId);
}
