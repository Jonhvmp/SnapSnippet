import { Request, Response, NextFunction } from 'express';
import * as snippetService from '../services/snnipets/snippetService';
import { handleValidationError } from '../utils/validationUtils';
import { Snippet } from '../models/Snippet';

export const createSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('Usuário não autenticado.');
    const snippet = await snippetService.createNewSnippet(req.body, req.user.id);
    res.status(201).json(snippet);
  } catch (error) {
    next(error);
  }
};

export const fetchMySnippets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('Usuário não autenticado.');
    const snippets = await snippetService.getUserSnippets(req.user.id);
    res.json(snippets);
  } catch (error) {
    next(error);
  }
};

export const getSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippet = await snippetService.getSnippetById(req.params.id);
    if (!snippet) return handleValidationError(res, 'Snippet não encontrado.');
    res.json(snippet);
  } catch (error) {
    next(error);
  }
};

export const updateSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippet = await snippetService.updateSnippet(req.params.id, req.body);
    if (!snippet) return handleValidationError(res, 'Snippet não encontrado.');
    res.json(snippet);
  } catch (error) {
    next(error);
  }
};

export const deleteSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await snippetService.deleteSnippet(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const fetchMySnippetsFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('Usuário não autenticado.');
    const snippets = await snippetService.getFavoriteSnippets(req.user.id);
    res.json(snippets);
  } catch (error) {
    next(error);
  }
};

export const markFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippet = await snippetService.toggleFavorite(req.params.id);
    res.json(snippet);
  } catch (error) {
    next(error);
  }
};

export const fetchPublicSnippets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippets = await snippetService.fetchPublicSnippets(req.query.query as string);
    res.json(snippets);
  } catch (error) {
    next(error);
  }
};

export const shareSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const host = req.get('host');
    if (!host) throw new Error('Host não encontrado.');
    if (!req.user?.id) throw new Error('Usuário não autenticado.');
    const link = await snippetService.shareSnippet(req.params.id, req.user.id, req.protocol, host);
    res.json({ link });
  } catch (error) {
    next(error);
  }
};

export const fetchSharedSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { link } = req.params;

    // Busca apenas pelo UUID no campo sharedLink
    const snippet = await Snippet.findOne({
      sharedLink: { $regex: `${link}$` }, // Busca o UUID no final do campo sharedLink
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet compartilhado não encontrado.' });
    }

    res.json({
      id: snippet._id,
      title: snippet.title,
      description: snippet.description,
      language: snippet.language,
      code: snippet.code,
      createdAt: snippet.createdAt,
    });
  } catch (error) {
    console.error('Erro ao buscar snippet compartilhado:', error);
    next(error);
  }
};
