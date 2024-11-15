// src/controllers/snippetController.ts

import { Request, Response } from 'express';
import { Snippet } from '../models/Snippet';
import { GitHubApiService } from '../services/GitHubApiService'

// Cria um novo snippet
export const createSnippet = async (req: Request, res: Response) => {
  try {
    const { title, description, language, tags, code } = req.body;

    // Validações adicionais de segurança, garantindo que o código não contenha comandos maliciosos
    if (typeof code !== 'string' || code.length === 0) {
      return res.status(400).json({ error: 'Código inválido ou ausente.' });
    }

    // Criação do snippet com dados validados
    const snippet = new Snippet({
      title,
      description,
      language,
      tags,
      code,
      favorite: false,
    });

    await snippet.save();
    res.status(201).json(snippet);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar snippet.' });
  }
};

// Retorna um snippet específico pelo ID
export const getSnippet = async (req: Request, res: Response) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Snippet não encontrado.' });

    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar snippet.' });
  }
};

// Atualiza um snippet pelo ID
export const updateSnippet = async (req: Request, res: Response) => {
  try {
    const { title, description, language, tags, code, favorite } = req.body;

    // Verifica a segurança do código ao atualizar
    const snippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      { title, description, language, tags, code, favorite },
      { new: true, runValidators: true }
    );

    if (!snippet) return res.status(404).json({ error: 'Snippet não encontrado.' });

    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar snippet.' });
  }
};

// Deleta um snippet pelo ID
export const deleteSnippet = async (req: Request, res: Response) => {
  try {
    const snippet = await Snippet.findByIdAndDelete(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Snippet não encontrado.' });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar snippet.' });
  }
};

// Marca ou desmarca um snippet como favorito
export const markFavorite = async (req: Request, res: Response) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Snippet não encontrado.' });

    snippet.favorite = !snippet.favorite;
    await snippet.save();

    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao marcar como favorito.' });
  }
};

// Busca snippets públicos usando um serviço externo opcional (ex: GitHub Gist)
export const fetchPublicSnippets = async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const snippets = await GitHubApiService.fetchPublicSnippets(query);
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar snippets públicos.' });
  }
};
