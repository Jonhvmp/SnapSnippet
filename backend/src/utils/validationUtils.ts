import { Response } from 'express';

export function handleValidationError(res: Response, message: string): void {
  console.log(`Erro de validação: ${message}`);
  res.status(400).json({ message });
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string, confirmPassword: string): boolean {
  return password.length >= 8 && password.length <= 128 && password === confirmPassword;
}
