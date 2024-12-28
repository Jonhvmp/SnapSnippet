import crypto from 'crypto'; // Gerar tokens aleatórios
import { IToken } from '../../models/Token';
import {
  findUserByEmail,
  findUserByUsername,
  createUser,
  findUserById
} from '../../repositories/userRepository'; // Importa as funções de manipulação de usuários
import {
  createResetToken,
  findValidResetToken,
  deleteResetToken
} from '../../repositories/tokenRepository'; // Importa as funções de manipulação de tokens
import {
  validateEmail,
  validatePassword
} from '../../utils/validationUtils';
import {
  generateAccessToken,
  generateRefreshToken
} from '../../utils/tokenUtils';
import { sendEmail } from '../../config/sendEmail';
import { Response } from 'express';

export async function registerUserService(username: string, email: string, password: string, confirmPassword: string): Promise<{ message: string }> {
  if (!username || !email || !password || !confirmPassword) {
    throw new Error('Todos os campos são obrigatórios');
  }

  if (username.length < 3 || username.length > 50) {
    throw new Error('O nome de usuário é obrigatório e deve ter entre 3 e 50 caracteres.');
  }

  if (!validateEmail(email)) {
    throw new Error('O e-mail é obrigatório e deve ser válido.');
  }

  const existingUserByEmail = await findUserByEmail(email);
  if (existingUserByEmail) {
    throw new Error('Email já está em uso');
  }

  const existingUserByUsername = await findUserByUsername(username);
  if (existingUserByUsername) {
    throw new Error('Nome de usuário já está em uso');
  }

  if (!validatePassword(password, confirmPassword)) {
    throw new Error('A senha é obrigatória e deve ter entre 8 e 128 caracteres e as senhas devem coincidir.');
  }

  const user = await createUser(username, email, password);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { message: 'Usuário registrado com sucesso' };
}

export async function loginUserService(email: string, password: string, res: Response): Promise<{ message: string }> {
  if (!email || !password) {
    throw new Error('Todos os campos são obrigatórios');
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  if (user.isLocked()) {
    throw new Error('Conta bloqueada devido a várias tentativas de login. Tente novamente mais tarde.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new Error('Credenciais inválidas');
  }

  user.loginAttempts = 0; // Reset login attempts
  user.lockUntil = null; // Remove lock on account caso exista um lock
  await user.save(); // Salva no BD

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Configurar cookies no objeto Response
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutos
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  });

  return { message: 'Login realizado com sucesso' };
}

export async function forgotPasswordService(email: string, baseUrl: string): Promise<{ message: string, resetLink: string }> {
  if (!email) {
    throw new Error('O e-mail é obrigatório');
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const resetToken = crypto.randomBytes(32).toString('hex'); // Gera um token aleatório
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // Hash do token
  const sessionId = crypto.randomBytes(16).toString('hex'); // Gera um ID de sessão aleatório
  const expiresAt = Date.now() + 20 * 60 * 1000; // 20 minutos

  await createResetToken(user._id.toString(), hashedToken, sessionId, expiresAt); // Salva o token no BD

  const resetLink = `${baseUrl}/reset-password/${resetToken}`;

  const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="color: #007bff; text-align: center;">Redefinição de Senha</h1>

        <p>Olá, <strong>${user.username}</strong>!</p>

        <p>Você solicitou a redefinição de sua senha. Para continuar, clique no botão abaixo:</p>

        <p style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #fff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          ">Redefinir Senha</a>
        </p>

        <p>Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:</p>
        <p style="word-wrap: break-word; background: #f9f9f9; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">${resetLink}</p>

        <p style="color: #555;">O link expira em <strong>20 minutos</strong>.</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="font-size: 12px; color: #777;">
          Se você precisar de ajuda, entre em contato com nosso suporte.
        </p>
        <p style="font-size: 12px; color: #777;">
          Este é um e-mail automático, por favor, não responda.
        </p>
        <p style="font-size: 12px; color: #777;">
          Se você não solicitou esta ação, pode ignorar este e-mail com segurança.
        </p>
      </div>
    `;

  await sendEmail(user.email, 'Redefinição de Senha', html);

  return { message: 'E-mail de redefinição de senha enviado com sucesso', resetLink };
}

export async function resetPasswordService(token: string, password: string, confirmPassword: string): Promise<{ message: string, redirect: string }> {
  if (!password || !confirmPassword) {
    throw new Error('Todos os campos são obrigatórios');
  }

  if (!validatePassword(password, confirmPassword)) {
    throw new Error('A senha é obrigatória e deve ter entre 8 e 128 caracteres e as senhas devem coincidir.');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex'); // Hash do token
  const tokenDoc: IToken | null = await findValidResetToken(hashedToken); // Busca o token no BD

  if (!tokenDoc) {
    throw new Error('Token inválido ou expirado');
  }

  const user = await findUserById(tokenDoc.userId.toString());
  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  user.password = password; // Atualiza a senha do usuário
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save(); // Salva no BD

  await deleteResetToken(tokenDoc._id.toString()); // Deleta o token do BD

  return {
    message: 'Senha redefinida com sucesso',
    redirect: '/'
  };
}
