// src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação ausente.' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as string) as { id: string };
    req.user = { id: decoded.id }; // Aqui adicionamos a propriedade `user`
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token de autenticação inválido.' });
  }
};
