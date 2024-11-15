// src/controllers/userController.ts

import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import env from '../config/env';

dotenv.config();

// Registra um novo usuário
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Verifica se o email já está em uso
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'E-mail já está em uso.' });

    // Cria e salva o novo usuário
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
};

// Realiza o login do usuário
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Procura o usuário pelo email
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ error: 'Credenciais inválidas.' });

    // Verifica a senha usando bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Credenciais inválidas.' });

    // Gera o token JWT
    const token = jwt.sign({ id: user._id }, env.JWT_SECRET as string, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
};

// Atualiza a senha do usuário
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Senha antiga inválida.' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar senha.' });
  }
};
