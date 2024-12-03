import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { TokenSchema } from '../models/Token';

dotenv.config();

const generateAccessToken = (user: any) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
};

const generateRefreshToken = (user: any) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string, confirmPassword: string): boolean => {
  return password.length >= 8 && password.length <= 128 && password === confirmPassword;
};

const handleValidationError = (res: Response, message: string): void => {
  res.status(400).json({ message });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      handleValidationError(res, 'Todos os campos são obrigatórios');
      return;
    }

    if (username.length < 3 || username.length > 50) {
      handleValidationError(res, 'O nome de usuário é obrigatório e deve ter entre 3 e 50 caracteres.');
      return;
    }

    if (!validateEmail(email)) {
      handleValidationError(res, 'O e-mail é obrigatório e deve ser válido.');
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      handleValidationError(res, 'Email já está em uso');
      return;
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      handleValidationError(res, 'Nome de usuário já está em uso');
      return;
    }

    if (!validatePassword(password, confirmPassword)) {
      handleValidationError(res, 'A senha é obrigatória e deve ter entre 8 e 128 caracteres e as senhas devem coincidir.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({ message: 'Usuário registrado com sucesso', accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      handleValidationError(res, 'Todos os campos são obrigatórios');
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      handleValidationError(res, 'Credenciais inválidas');
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      handleValidationError(res, 'Credenciais inválidas');
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      handleValidationError(res, 'O e-mail é obrigatório');
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      handleValidationError(res, 'Usuário não encontrado');
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const token = new TokenSchema({
      userId: user._id,
      token: hashedToken,
      expiresAt: Date.now() + 20 * 60 * 1000 // 20 minutes
    });

    await token.save();

    const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    res.json({ message: 'E-mail de redefinição de senha enviado com sucesso', resetLink });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      handleValidationError(res, 'Todos os campos são obrigatórios');
      return;
    }

    if (!validatePassword(password, confirmPassword)) {
      handleValidationError(res, 'A senha é obrigatória e deve ter entre 8 e 128 caracteres e as senhas devem coincidir.');
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tokenDoc = await TokenSchema.findOne({ TokenSchema: hashedToken, expiresAt: { $gt: Date.now() } });

    if (!tokenDoc) {
      handleValidationError(res, 'Token inválido ou expirado');
      return;
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      handleValidationError(res, 'Usuário não encontrado');
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    await TokenSchema.deleteOne({ _id: tokenDoc._id });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ message: 'Senha redefinida com sucesso', accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};
