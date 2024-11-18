// src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

export const validateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next({ status: 401, message: 'Token de autenticação ausente.' }); // Passa o erro para o middleware de erro
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as string) as { id: string };
    req.user = { id: decoded.id }; // Adiciona a propriedade `user` no objeto da requisição
    next();
  } catch (error) {
    next({ status: 401, message: 'Token de autenticação inválido.' }); // Passa o erro para o middleware de erro
  }
};
