import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword } from '../controllers/authController';
import { body } from 'express-validator';
import { ValidationChain, Result, validationResult } from 'express-validator';

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
        }
        ),
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
    return; // Interrompe o fluxo após enviar a resposta
  }
  next(); // Passa para o próximo middleware/rota se não houver erros
};


const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  console.log(`Executando função assíncrona para a rota: ${req.path}`);
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(`Erro ao executar função assíncrona para a rota: ${req.path}`, error);
    next(error);
  });
};

const router = Router();

// Rotas para usuários
router.post('/register', validate('register'), validateRequest, asyncHandler(registerUser)); // Registro de um novo usuário

router.post('/login', validate('login'), validateRequest, asyncHandler(loginUser)); // Login de usuário

// Rotas de forgot e reset password
router.post('/forgot-password', validate('forgot-password'), asyncHandler(forgotPassword)); // Solicitação de redefinição de senha
router.post('/reset-password', validate('reset-password'), asyncHandler(resetPassword)); // Redefinição de senha

router.use((err: any, req: any, res: any) => {
  console.error(`Erro no tratamento da rota: ${req.path}`, err);
  res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
});

export default router;