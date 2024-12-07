import { Router } from 'express';
import { validateToken } from '../middlewares/authMiddleware';
import { errorMiddleware } from '../middlewares/errorMiddleware';
import {
  createSnippet,
  updateSnippet,
  getSnippet,
  deleteSnippet,
  markFavorite,
  fetchMySnippets,
  fetchMySnippetsFavorite,
  fetchPublicSnippets,
  fetchSharedSnippet,
  shareSnippet,
} from '../controllers/snippetController';

const router = Router();

// Rotas para snippets
router.get('/public-snippets', validateToken, (req, res, next) => {
  fetchPublicSnippets(req, res, next).catch(next); // Propaga erros ao middleware
}); // Busca snippets públicos

router.post('/create-snippets', validateToken, (req, res, next) => {
  createSnippet(req, res, next).catch(next);
}); // Criação de um novo snippet

router.get('/my-snippets', validateToken, (req, res, next) => {
  fetchMySnippets(req, res, next).catch(next);
}); // Busca snippets do usuário

router.get('/my-favorites', validateToken, (req, res, next) => {
  fetchMySnippetsFavorite(req, res, next).catch(next);
}); // Busca snippets favoritos do usuário

router.get('/search', validateToken, (req, res, next) => {
  fetchPublicSnippets(req, res, next).catch(next);
}); // Busca snippets por termo

router.get('/tags', validateToken, (req, res, next) => {
  fetchPublicSnippets(req, res, next).catch(next);
}); // Busca snippets por tag

router.get('/shared/:link', fetchSharedSnippet); // Busca snippets compartilhados com o usuário

router.post('/:id/share', validateToken, (req, res, next) => {
  shareSnippet(req, res, next).catch(next);
}); // Compartilha um snippet

router.put('/:id', validateToken, (req, res, next) => {
  updateSnippet(req, res, next).catch(next);
}); // Atualização de um snippet existente

router.delete('/:id', validateToken, (req, res, next) => {
  deleteSnippet(req, res, next).catch(next);
}); // Exclusão de um snippet

router.get('/:id', validateToken, (req, res, next) => {
  getSnippet(req, res, next).catch(next);
}); // Busca um snippet específico

router.patch('/:id/favorite', validateToken, (req, res, next) => {
  markFavorite(req, res, next).catch(next);
}); // Marca ou desmarca como favorito

// Middleware de tratamento de erros
router.use(errorMiddleware);

export default router;
