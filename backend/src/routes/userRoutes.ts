import { Router } from 'express';
import { register, login } from '../controllers/userController';
import { body } from 'express-validator'
import { ValidationChain } from 'express-validator';

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
    default:
      return [];
  }
};

const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();

// Rotas para usuários
router.post('/register', validate('register'), asyncHandler(register)); // Registro de um novo usuário
router.post('/login', validate('login'), asyncHandler(login)); // Login de usuário

export default router;
