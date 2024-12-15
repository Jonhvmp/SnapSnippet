import { v4 as uuidv4 } from 'uuid';
import {
  createSnippet,
  findSnippetsByUser,
  findSnippetById,
  updateSnippetById,
  deleteSnippetById,
  findFavoriteSnippetsByUser,
  findSnippetBySharedLink,
} from '../../repositories/snippetRepository';
import { GitHubApiService } from '../github/GitHubApiService';

export const createNewSnippet = async (data: any, userId: string) => {
  const { title, description, language, tags, code } = data;

  // Adiciona valores padrão
  const snippetData = {
    title: title || 'Snippet sem título',
    description: description || 'Snippet sem descrição',
    language: language || 'text',
    tags,
    code,
    favorite: false,
    user: userId,
  };

  return createSnippet(snippetData);
};

export const getUserSnippets = (userId: string) => {
  return findSnippetsByUser(userId);
};

export const getSnippetById = (id: string) => {
  return findSnippetById(id);
};

export const updateSnippet = (id: string, updateData: any) => {
  return updateSnippetById(id, updateData);
};

export const deleteSnippet = (id: string) => {
  return deleteSnippetById(id);
};

export const getFavoriteSnippets = (userId: string) => {
  return findFavoriteSnippetsByUser(userId);
};

export const toggleFavorite = async (id: string) => {
  const snippet = await findSnippetById(id);
  if (!snippet) throw new Error('Snippet não encontrado.');

  snippet.favorite = !snippet.favorite;
  return snippet.save();
};

export const fetchPublicSnippets = (query: string) => {
  return GitHubApiService.fetchPublicSnippets(query);
};

export const shareSnippet = async (id: string, userId: string, protocol: string, host: string) => {
  const snippet = await findSnippetById(id);
  if (!snippet) throw new Error('Snippet não encontrado.');

  if (snippet.user.toString() !== userId) {
    throw new Error('Snippet não pertence ao usuário autenticado.');
  }

  if (!snippet.sharedLink) {
    const uniqueLink = `${protocol}://${host}/api/snippets/shared/${uuidv4()}`;
    snippet.sharedLink = uniqueLink;
    await snippet.save();
  }

  return snippet.sharedLink;
};

export const getSharedSnippet = (link: string) => {
  return findSnippetBySharedLink(link);
};
