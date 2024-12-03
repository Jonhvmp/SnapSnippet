import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Token } from '../models/Token'; // Model do Token
import { handleValidationError } from '../utils/validationUtils';

export const validateResetToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      return handleValidationError(res, 'Token de redefinição de senha ausente');
    }

    // Cria o hash do token recebido
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Busca no banco de dados
    const tokenDoc = await Token.findOne({ token: hashedToken, expiresAt: { $gt: Date.now() } });
    if (!tokenDoc) {
      return handleValidationError(res, 'Token de redefinição de senha inválido ou expirado');
    }

    // Se tudo estiver certo, segue para o próximo middleware/rota
    next();
  } catch (error) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
};
