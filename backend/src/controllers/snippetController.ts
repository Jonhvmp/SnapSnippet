// src/controllers/snippetController.ts

import { Request, Response, NextFunction } from 'express';
import { Snippet } from '../models/Snippet';
import { GitHubApiService } from '../services/GitHubApiService';

// Cria um novo snippet
export const createSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, language, tags, code } = req.body;

    // Validações adicionais de segurança
    if (typeof code !== 'string' || code.length === 0) {
      return res.status(400).json({ error: 'Código inválido ou ausente.' });
    }

    const snippet = new Snippet({
      title,
      description,
      language,
      tags,
      code,
      favorite: false,
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
      return res.status(400).json({ error: 'Código inválido ou ausente.' });
    }

    await snippet.save();
    res.status(201).json(snippet);
  } catch (error) {
    console.error('Erro ao criar snippet:', error);
    next(error); // Propaga o erro para o middleware de tratamento de erros
  }
};

// Retorna um snippet específico pelo ID
export const getSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Snippet não encontrado.' });

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

    const snippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      { title, description, language, tags, code, favorite },
      { new: true, runValidators: true }
    );

    if (!snippet) return res.status(404).json({ error: 'Snippet não encontrado.' });

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
    if (!snippet) return res.status(404).json({ error: 'Snippet não encontrado.' });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar snippet:', error);
    next(error);
  }
};

// Marca ou desmarca um snippet como favorito
export const markFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Snippet não encontrado.' });

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
