import jwt from 'jsonwebtoken';
import env from '../config/env';
import { IUser } from '../models/User';

export function generateAccessToken(user: IUser): string {
  return jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET as string, { expiresIn: '1h' });
}

export function generateRefreshToken(user: IUser): string {
  return jwt.sign({ id: user.id }, env.JWT_SECRET as string, { expiresIn: '7d' });
}
