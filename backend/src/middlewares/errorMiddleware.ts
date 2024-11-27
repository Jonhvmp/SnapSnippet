import { Request, Response, NextFunction } from 'express';

// Middleware de tratamento de erros
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro:', err);

  if (res.headersSent) {
    // Garante que não tenta enviar outra resposta se os headers já foram enviados
    return next(err);
  }

  const statusCode = err.status || 500;
  const message = err.message || 'Erro interno do servidor.';

  res.status(statusCode).json({
    success: false,
    message,
    details: err.details || null, // Detalhes adicionais, se existirem
  });
};
