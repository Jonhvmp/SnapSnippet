import { Router } from 'express';
import { errorMiddleware } from '../middlewares/errorMiddleware';
import { registerUser, loginUser } from '../controllers/userController';

const router = Router();

// Rotas para gerenciamento de usuários
router.post('/register', registerUser); // Registro de um novo usuário
router.post('/login', loginUser); // Login de usuário

// Middleware de tratamento de erros
router.use(errorMiddleware);

export default router;
