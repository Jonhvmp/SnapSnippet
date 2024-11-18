import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
// import env from '../config/env';

import dotenv from 'dotenv'

dotenv.config();

const generateAccessToken = (user: any) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
};

const generateRefreshToken = (user: any) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      res.status(400).json({ message: 'Todos os campos são obrigatórios' });
      return;
      console.log('Todos os campos são obrigatórios');
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: 'As senhas não coincidem' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email já está em uso' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({ message: 'Usuário registrado com sucesso', accessToken, refreshToken });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Credenciais inválidas' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Credenciais inválidas' });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};
