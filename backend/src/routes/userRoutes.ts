import { Router } from 'express';
import { register, login } from '../controllers/userController';

const router = Router();

// Rotas para usuários
router.post('/register', async (req, res, next) => {
  try {
    await register(req, res);
  } catch (error) {
    next(error); // Propaga o erro para o middleware de tratamento
  }
});

router.post('/login', async (req, res, next) => {
  try {
    await login(req, res);
  } catch (error) {
    next(error); // Propaga o erro para o middleware de tratamento
  }
});

export default router;
