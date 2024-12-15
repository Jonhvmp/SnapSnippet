// src/controllers/snippetController.ts

import { Request, Response, NextFunction } from 'express';
import { Snippet } from '../models/Snippet';
import { GitHubApiService } from '../services/github/GitHubApiService';
import { v4 as uuidv4 } from 'uuid';
// import { validationResult } from 'express-validator';
import { handleValidationError } from '../utils/validationUtils';

// Cria um novo snippet
export const createSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, language, tags, code } = req.body;

    // Validações adicionais de segurança
    if (typeof code !== 'string' || code.length === 0) {
      return handleValidationError(res, 'Código inválido ou ausente.');
    }

    if (!req.user) {
      return handleValidationError(res, 'Usuário não autenticado.');
    }

    const snippet = new Snippet({
      title,
      description,
      language,
      tags,
      code,
      favorite: false,
      user: req.user.id,
    });

    if (snippet.title === '' || snippet.title === undefined || snippet.title === null) { // Adiciona um título padrão
      snippet.title = 'Snippet sem título';
    }

    if (snippet.description === '' || snippet.description === undefined || snippet.description === null) {
      snippet.description = 'Snippet sem descrição';
    }

    if (snippet.language === '' || snippet.language === undefined || snippet.language === null) {
      snippet.language = 'text';
    }

    if (snippet.tags === '' as unknown as Array<any> || snippet.tags === undefined || snippet.tags === null) {
      snippet.tags = []; // nesse caso essa array é vazia
    }

    if (snippet.code === '' || snippet.code === undefined || snippet.code === null) {
      return handleValidationError(res, 'Código inválido ou ausente.');
    }

    await snippet.save();
    res.status(201).json(snippet);
  } catch (error) {
    console.error('Erro ao criar snippet:', error);
    next(error); // Propaga o erro para o middleware de tratamento de erros
  }
};

// Busca todos os snippets do usuário
export const fetchMySnippets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return handleValidationError(res, 'Usuário não autenticado.');
    }
    const snippets = await Snippet.find({ user: req.user.id });
    res.json(snippets);
  } catch (error) {
    console.error('Erro ao buscar snippets do usuário:', error);
    next(error);
  }
};

// Retorna um snippet específico pelo ID
export const getSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return handleValidationError(res, 'Snippet não encontrado.');

    res.json(snippet);
  } catch (error) {
    console.error('Erro ao buscar snippet:', error);
    next(error);
  }
};

// Atualiza um snippet pelo ID
export const updateSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, language, tags, code, favorite } = req.body;

    // Validate input data
    if (typeof title !== 'string' ||
      typeof description !== 'string' ||
      typeof language !== 'string' ||
      !Array.isArray(tags) ||
      typeof code !== 'string' ||
      typeof favorite !== 'boolean') {
      return handleValidationError(res, 'Dados inválidos.');
    }

    const snippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, language, tags, code, favorite } },
      { new: true, runValidators: true }
    );

    if (!snippet) return handleValidationError(res, 'Snippet não encontrado.');

    res.json(snippet);
  } catch (error) {
    console.error('Erro ao atualizar snippet:', error);
    next(error);
  }
};

// Deleta um snippet pelo ID
export const deleteSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippet = await Snippet.findByIdAndDelete(req.params.id);
    if (!snippet) return handleValidationError(res, 'Snippet não encontrado.');

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar snippet:', error);
    next(error);
  }
};

// Busca snippets favoritos do usuário
export const fetchMySnippetsFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return handleValidationError(res, 'Usuário não autenticado.');
    }
    const snippets = await Snippet.find({ user: req.user.id, favorite: true });
    res.json(snippets);
  } catch (error) {
    console.error('Erro ao buscar snippets favoritos do usuário:', error);
    next(error);
  }
}

// Marca ou desmarca um snippet como favorito
export const markFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return handleValidationError(res, 'Snippet não encontrado.');

    snippet.favorite = !snippet.favorite;
    await snippet.save();

    res.json(snippet);
  } catch (error) {
    console.error('Erro ao marcar snippet como favorito:', error);
    next(error);
  }
};

// Busca snippets públicos usando um serviço externo opcional (ex: GitHub Gist)
export const fetchPublicSnippets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.query as string;
    const snippets = await GitHubApiService.fetchPublicSnippets(query);
    res.json(snippets);
  } catch (error) {
    console.error('Erro ao buscar snippets públicos:', error);
    next(error);
  }
};

export const shareSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return handleValidationError(res, 'Snippet não encontrado.');

    // Verifica se o snippet pertence ao usuário autenticado
    if (snippet.user.toString() !== req.user?.id) {
      return handleValidationError(res, 'Snippet não pertence ao usuário autenticado.');
    }

    if (!snippet.sharedLink) {
      const uniqueLink = `${req.protocol}://${req.get('host')}/api/snippets/shared/${uuidv4()}`;
      snippet.sharedLink = uniqueLink;
      await snippet.save();
    }

    res.json({ link: snippet.sharedLink });
    console.log('Snippet compartilhado:', snippet);
  } catch (error) {
    console.error('Erro ao compartilhar snippet:', error);
    next(error);
  }
};

export const fetchSharedSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const link = `${req.protocol}://${req.get('host')}/api/snippets/shared/${req.params.link}`;
    const snippet = await Snippet.findOne({ sharedLink: link });
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

// deleta link compartilhado
// export const deleteSharedLink = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const snippet = await Snippet.findById(req.params.id);
//     if (!snippet) return handleValidationError(res, 'Snippet não encontrado.');

//     snippet.sharedLink = null;
//     await snippet.save();

//     res.json({ message: 'Link compartilhado removido.' });
//   } catch (error) {
//     console.error('Erro ao deletar link compartilhado:', error);
//     next(error);
//   }
// };
