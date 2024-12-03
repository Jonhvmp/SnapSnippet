import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import crypto from 'crypto';
import { Token } from '../models/Token';
import env from '../config/env';
import { sendEmail } from '../config/sendEmail';

const generateAccessToken = (user: any) => {
  return jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET as string, { expiresIn: '1h' });
};

const generateRefreshToken = (user: any) => {
  return jwt.sign({ id: user.id }, env.JWT_SECRET as string, { expiresIn: '7d' });
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string, confirmPassword: string): boolean => {
  return password.length >= 8 && password.length <= 128 && password === confirmPassword;
};

const handleValidationError = (res: Response, message: string): void => {
  console.log(`Erro de validação: ${message}`);
  res.status(400).json({ message });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return handleValidationError(res, 'Todos os campos são obrigatórios');
    }

    if (username.length < 3 || username.length > 50) {
      return handleValidationError(res, 'O nome de usuário é obrigatório e deve ter entre 3 e 50 caracteres.');
    }

    if (!validateEmail(email)) {
      return handleValidationError(res, 'O e-mail é obrigatório e deve ser válido.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleValidationError(res, 'Email já está em uso');
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return handleValidationError(res, 'Nome de usuário já está em uso');
    }

    if (!validatePassword(password, confirmPassword)) {
      return handleValidationError(res, 'A senha é obrigatória e deve ter entre 8 e 128 caracteres e as senhas devem coincidir.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    console.log(`Usuário registrado: ${user.id}`);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({ message: 'Usuário registrado com sucesso', accessToken, refreshToken });
  } catch (error) {
    console.error(`Erro ao registrar usuário: ${error as Error}`);
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return handleValidationError(res, 'Todos os campos são obrigatórios');
    }

    const user = await User.findOne({ email }).select('+password'); // Inclui a senha na consulta
    if (!user) {
      return handleValidationError(res, 'Credenciais inválidas');
    }

    // Verifica se o usuário está bloqueado
    if (user.isLocked()) {
      return handleValidationError(res, 'Conta bloqueada devido a várias tentativas de login. Tente novamente mais tarde.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts(); // Incrementa tentativas de login
      return handleValidationError(res, 'Credenciais inválidas');
    }

    // Login bem-sucedido: redefinir tentativas de login
    user.loginAttempts = 0;
    user.lockUntil = null; // Remove bloqueios, caso tenha
    await user.save();

    console.log(`Usuário logado: ${user.id}`);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(`Erro ao fazer login: ${error as Error}`);
    next(error);
  }
};


export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return handleValidationError(res, 'O e-mail é obrigatório');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return handleValidationError(res, 'Usuário não encontrado');
    }

    // Gera os tokens e ID da sessão
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const sessionId = crypto.randomBytes(16).toString('hex'); // Gera um ID de sessão único

    // Cria o token no banco
    const token = new Token({
      userId: user._id,
      token: hashedToken,
      sessionId: sessionId,
      expiresAt: Date.now() + 20 * 60 * 1000, // 20 minutos
    });

    await token.save();

    console.log(`Token gerado para o usuário ID: ${user.id} com nome de usuário NOME: ${user.username}`);
    console.log(`Token de redefinição de senha gerado: resetToken=${resetToken}, hashedToken=${hashedToken}, sessionId=${sessionId}`);

    // Cria o link de redefinição de senha
    const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // Envia o e-mail de redefinição
    const html = `
      <h1>Redefinição de Senha</h1>
      <p>Olá, ${user.username}!</p>
      <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para continuar:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>O link expira em 20 minutos.</p>
      <p>Se você não solicitou esta ação, ignore este e-mail.</p>
    `;

    await sendEmail(user.email, 'Redefinição de Senha', html);

    res.json({ message: 'E-mail de redefinição de senha enviado com sucesso', resetLink });
  } catch (error) {
    console.error(`Erro ao solicitar redefinição de senha: ${(error as Error).message}`);
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    if (!password || !confirmPassword) {
      return handleValidationError(res, 'Todos os campos são obrigatórios');
    }

    if (!validatePassword(password, confirmPassword)) {
      return handleValidationError(res, 'A senha é obrigatória e deve ter entre 8 e 128 caracteres e as senhas devem coincidir.');
    }

    // O token já foi validado no middleware
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tokenDoc = await Token.findOne({ token: hashedToken, expiresAt: { $gt: Date.now() } });

    if (!tokenDoc) {
      return handleValidationError(res, 'Token inválido ou expirado');
    }

    // Busca o usuário associado ao token
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return handleValidationError(res, 'Usuário não encontrado');
    }

    // Atualiza a senha
    user.password = await bcrypt.hash(password, 10);
    user.loginAttempts = 0; // Reseta tentativas de login
    user.lockUntil = null; // Remove bloqueios, se houver
    await user.save();

    // Remove o token de redefinição após uso
    await Token.deleteOne({ _id: tokenDoc._id });

    console.log(`Senha redefinida para o usuário: ${user.id}`);

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error(`Erro ao redefinir senha: ${error as Error}`);
    next(error);
  }
};
