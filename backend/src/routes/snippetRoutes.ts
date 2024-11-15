// src/routes/snippetRoutes.ts

import express from 'express';
import { fetchPublicSnippets } from '../controllers/snippetController';

const router = express.Router();

// Rota para buscar snippets públicos
router.get('/public-snippets', fetchPublicSnippets);

export default router;
