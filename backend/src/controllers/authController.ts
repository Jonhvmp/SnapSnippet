import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';

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
    }

    if (username.length < 3 || username.length > 50) {
      res.status(400).json({ message: 'O nome de usuário é obrigatório e deve ter entre 3 e 50 caracteres.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'O e-mail é obrigatório e deve ser válido.' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email já está em uso' });
      return;
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      res.status(400).json({ message: 'Nome de usuário já está em uso' });
      return;
    }

    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ message: 'A senha é obrigatória e deve ter entre 8 e 128 caracteres.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: 'As senhas não coincidem' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({ message: 'Usuário registrado com sucesso', accessToken, refreshToken });
    return;
  } catch (error) {
    next(error); // Passa o erro para o middleware de tratamento de erros
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Todos os campos são obrigatórios' });
      return;
    }

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
    console.error('Erro ao fazer login:', error);
    next(error);
  }
};
