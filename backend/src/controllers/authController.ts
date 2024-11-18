// src/controllers/authController.ts - Controle de autenticacao

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import env from '../config/env';

// função de gerar token de autenticação
const generateAccessToken = (user: any) => {
  return jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '1h' });
};

// função de regenerar token de acesso
const generateRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'O token de atualização é necessário' });
  }

  jwt.verify(refreshToken, env.JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token de atualização inválido' });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
};

// registro de usuario
exports.registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    const user = new User({ username, email, password });
    await user.save();

    // gerar tokens de acesso
    const accessToken = generateAccessToken(user._id);
    const refreshToken = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: '7d' });

    // Armazenar o refresh token no cookie (HTTP-only)
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    res.json({ accessToken }); // enviar token de acesso
    res.status(201).json({ message: 'Usuário registrado com sucesso', accessToken });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar o usuário' });
  };
  }
