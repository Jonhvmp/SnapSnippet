import { Request, Response, NextFunction } from 'express';

// Middleware de tratamento de erros
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro:', err);

  const statusCode = err.status || 500;
  const message = err.message || 'Erro interno do servidor.';

  res.status(statusCode).json({
    success: false,
    message,
  });
};
