import { Router, Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { body } from 'express-validator';
import { ValidationChain, Result, validationResult } from 'express-validator';
import { validateResetToken } from '../middlewares/validateResetToken';
import { limiter } from '../utils/rateLimiting';

// Criando um method switch para validação de campos
interface ValidationMethod {
  (method: string): ValidationChain[];
}

const validate: ValidationMethod = (method) => {
  switch (method) {
    case 'register':
      return [
        body('username').exists().isString().isLength({ min: 3, max: 50 }).withMessage('O nome de usuário é obrigatório e deve ter entre 3 e 50 caracteres.'),
        body('email').exists().isEmail().withMessage('O e-mail é obrigatório e deve ser válido.'),
        body('password').exists().isString().isLength({ min: 8, max: 128 }).withMessage('A senha é obrigatória e deve ter entre 8 e 128 caracteres.'),
      ];

    case 'login':
      return [
        body('email').exists().isEmail().withMessage('O e-mail é obrigatório e deve ser válido.'),
        body('password').exists().isString().withMessage('A senha é obrigatória.'),
      ];

    case 'forgot-password':
      return [
        body('email').exists().isEmail().withMessage('O e-mail é obrigatório e deve ser válido.'),
      ];

    case 'reset-password':
      return [
        body('password').exists().isString().isLength({ min: 8, max: 128 }).withMessage('A senha é obrigatória e deve ter entre 8 e 128 caracteres.'),
        body('confirmPassword').exists().isString().custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('As senhas não coincidem.');
          }
          return true;
        }),
      ];
    default:
      throw new Error('Método de validação não encontrado.');
  }
};

const validateRequest = (req: Request, res: Response, next: NextFunction): void | Promise<void> => {
  const errors: Result = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Falha na validação.',
      errors: errors.array(),
    });
    return;
  }
  next();
};

const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();

// Rotas para usuários
router.post('/register', validate('register'), limiter, validateRequest, asyncHandler(registerUser)); // Registro de um novo usuário

router.post('/login', validate('login'), limiter, validateRequest, asyncHandler(loginUser)); // Login de usuário

// Rotas de forgot e reset password
router.post('/forgot-password', limiter, validate('forgot-password'), validateRequest, asyncHandler(forgotPassword)); // Solicitação de redefinição de senha

router.post('/reset-password/:token', limiter, validateResetToken, validate('reset-password'), validateRequest, asyncHandler(resetPassword));

// Middleware de tratamento de erros
router.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((error: any) => error.message);
    res.status(400).json({ message: 'Erro de validação', errors: messages });
    return;
  }

  console.error('Erro no tratamento da rota: %s', req.path, err);
  res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
});

export default router;
