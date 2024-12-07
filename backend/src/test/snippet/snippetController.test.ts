import { Request, Response, NextFunction } from 'express';
import { Snippet } from '../../models/Snippet';
import * as snippetController from '../../controllers/snippetController';
import { GitHubApiService } from '../../services/GitHubApiService';

// Mock das dependências
jest.mock('../../models/Snippet');
jest.mock('../../services/GitHubApiService');

describe('Snippet Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, user: { id: 'user123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  describe('createSnippet', () => {
    it('deve criar um snippet com sucesso', async () => {
      req.body = {
        title: 'Snippet Test',
        description: 'Descrição de teste',
        language: 'javascript',
        tags: ['test'],
        code: 'console.log("Hello World");',
      };

      const mockSave = jest.fn().mockResolvedValue(req.body);
      (Snippet as jest.MockedClass<typeof Snippet>).mockImplementation(() => ({
        ...req.body,
        save: mockSave,
      } as any));

      await snippetController.createSnippet(req as Request, res as Response, next);

      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body));
    });

    it('deve retornar erro se código estiver ausente', async () => {
      req.body = { ...req.body, code: '' };

      await snippetController.createSnippet(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Código inválido ou ausente.',
      });
    });
  });

  describe('fetchMySnippets', () => {
    it('deve buscar snippets do usuário autenticado', async () => {
      const mockSnippets = [{ id: 'snippet1', title: 'Teste' }];
      (Snippet.find as jest.Mock).mockResolvedValue(mockSnippets);

      await snippetController.fetchMySnippets(req as Request, res as Response, next);

      expect(Snippet.find).toHaveBeenCalledWith({ user: req.user?.id });
      expect(res.json).toHaveBeenCalledWith(mockSnippets);
    });

    it('deve retornar erro se o usuário não estiver autenticado', async () => {
      req.user = undefined;

      await snippetController.fetchMySnippets(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuário não autenticado.',
      });
    });
  });

  describe('getSnippet', () => {
    it('deve retornar um snippet pelo ID', async () => {
      const mockSnippet = { id: 'snippet1', title: 'Teste' };
      (Snippet.findById as jest.Mock).mockResolvedValue(mockSnippet);

      req.params = { id: 'snippet1' };

      await snippetController.getSnippet(req as Request, res as Response, next);

      expect(Snippet.findById).toHaveBeenCalledWith('snippet1');
      expect(res.json).toHaveBeenCalledWith(mockSnippet);
    });

    it('deve retornar erro se o snippet não for encontrado', async () => {
      (Snippet.findById as jest.Mock).mockResolvedValue(null);

      req.params = { id: 'invalidId' };

      await snippetController.getSnippet(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Snippet não encontrado.',
      });
    });
  });

  describe('updateSnippet', () => {
    it('deve atualizar um snippet pelo ID', async () => {
      const mockSnippet = { id: 'snippet1', title: 'Snippet Atualizado' };
      (Snippet.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockSnippet);

      req.params = { id: 'snippet1' };
      req.body = { title: 'Snippet Atualizado' };

      await snippetController.updateSnippet(req as Request, res as Response, next);

      expect(Snippet.findByIdAndUpdate).toHaveBeenCalledWith(
        'snippet1',
        req.body,
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockSnippet);
    });

    it('deve retornar erro se o snippet não for encontrado', async () => {
      (Snippet.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      req.params = { id: 'invalidId' };

      await snippetController.updateSnippet(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Snippet não encontrado.',
      });
    });
  });

  describe('deleteSnippet', () => {
    it('deve deletar um snippet pelo ID', async () => {
      (Snippet.findByIdAndDelete as jest.Mock).mockResolvedValue({ id: 'snippet1' });

      req.params = { id: 'snippet1' };

      await snippetController.deleteSnippet(req as Request, res as Response, next);

      expect(Snippet.findByIdAndDelete).toHaveBeenCalledWith('snippet1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('deve retornar erro se o snippet não for encontrado', async () => {
      (Snippet.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      req.params = { id: 'invalidId' };

      await snippetController.deleteSnippet(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Snippet não encontrado.',
      });
    });
  });

  describe('fetchPublicSnippets', () => {
    it('deve buscar snippets públicos usando GitHubApiService', async () => {
      const mockSnippets = [{ id: 'snippet1', title: 'Snippet Público' }];
      (GitHubApiService.fetchPublicSnippets as jest.Mock).mockResolvedValue(mockSnippets);

      req.query = { query: 'javascript' };

      await snippetController.fetchPublicSnippets(req as Request, res as Response, next);

      expect(GitHubApiService.fetchPublicSnippets).toHaveBeenCalledWith('javascript');
      expect(res.json).toHaveBeenCalledWith(mockSnippets);
    });
  });
});
