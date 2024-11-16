import { Router } from 'express';
import { validateToken } from '../middlewares/authMiddleware';
import { errorMiddleware } from '../middlewares/errorMiddleware';
import { fetchPublicSnippets, createSnippet, updateSnippet, deleteSnippet } from '../controllers/snippetController';

const router = Router();

// Rotas para snippets
router.get('/public-snippets', validateToken, fetchPublicSnippets); // Busca snippets públicos
router.post('/', validateToken, createSnippet); // Criação de um novo snippet
router.put('/:id', validateToken, updateSnippet); // Atualização de um snippet existente
router.delete('/:id', validateToken, deleteSnippet); // Exclusão de um snippet

// Middleware de tratamento de erros
router.use(errorMiddleware);

export default router;
