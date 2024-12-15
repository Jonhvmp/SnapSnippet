import { Request, Response, NextFunction } from 'express';
import { registerUserService, loginUserService, forgotPasswordService, resetPasswordService } from '../services/auth/authService';
import { handleValidationError } from '../utils/validationUtils';

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    const { message, accessToken, refreshToken } = await registerUserService(username, email, password, confirmPassword);
    res.status(201).json({ message, accessToken, refreshToken });
  } catch (error: any) {
    handleValidationError(res, error.message);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await loginUserService(email, password);
    res.json({ accessToken, refreshToken });
  } catch (error: any) {
    handleValidationError(res, error.message);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const { message, resetLink } = await forgotPasswordService(email, baseUrl);
    res.json({ message, resetLink });
  } catch (error: any) {
    handleValidationError(res, error.message);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    const { message, redirect, accessToken, refreshToken } = await resetPasswordService(token, password, confirmPassword);
    res.status(200).json({ message, redirect, accessToken, refreshToken });
  } catch (error: any) {
    handleValidationError(res, error.message);
  }
};
