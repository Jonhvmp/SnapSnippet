import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

export const validateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'Token de autenticação ausente.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };
    next();
    return;
  } catch (error) {
    res.status(401).json({ message: 'Token de autenticação inválido.' });
  }
};
