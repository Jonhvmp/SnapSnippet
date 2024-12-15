import { Request, Response, NextFunction } from 'express';
import { Snippet } from '../../models/Snippet';
import * as snippetController from '../../controllers/snippetController';
import { GitHubApiService } from '../../services/github/GitHubApiService';
import { v4 as uuidv4 } from 'uuid';

// Mock das dependências
jest.mock('../../models/Snippet');
jest.mock('../../services/GitHubApiService');
jest.mock('uuid', () => ({ v4: jest.fn(() => 'mocked-uuid') }));

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

  afterEach(() => {
    jest.clearAllMocks(); // Limpa todos os mocks após cada teste
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
        message: 'Código inválido ou ausente.',
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

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário não autenticado.',
      });
    });
  });

  describe('shareSnippet', () => {
    it('deve gerar um link de compartilhamento para o snippet', async () => {
      const mockSnippet = {
        _id: 'snippet1',
        user: 'user123', // Adicione o campo user no mock
        sharedLink: null,
        save: jest.fn().mockResolvedValue(true),
      };
      (Snippet.findById as jest.Mock).mockResolvedValue(mockSnippet);

      req.params = { id: 'snippet1' };
      Object.defineProperty(req, 'protocol', { value: 'http' });
      req.get = jest.fn().mockReturnValue('localhost:3000');

      await snippetController.shareSnippet(req as Request, res as Response, next);

      expect(Snippet.findById).toHaveBeenCalledWith('snippet1');
      expect(mockSnippet.save).toHaveBeenCalled();
      expect(mockSnippet.sharedLink).toBe('http://localhost:3000/api/snippets/shared/mocked-uuid');
      expect(res.json).toHaveBeenCalledWith({ link: mockSnippet.sharedLink });
    });

    it('deve retornar erro se o snippet não for encontrado', async () => {
      (Snippet.findById as jest.Mock).mockResolvedValue(null);

      req.params = { id: 'invalidId' };

      await snippetController.shareSnippet(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Snippet não encontrado.' });
    });
  });

  describe('fetchSharedSnippet', () => {
    it('deve buscar um snippet compartilhado pelo link', async () => {
      const mockSnippet = {
        _id: 'snippet1',
        sharedLink: 'http://localhost:3000/shared/mocked-uuid',
        code: 'console.log("Hello World");',
        createdAt: new Date(),
        description: 'Descrição de teste',
        id: 'snippet1',
        language: 'javascript',
        title: 'Snippet Test',
      };
      (Snippet.findOne as jest.Mock).mockResolvedValue(mockSnippet);

      req.params = { link: 'http://localhost:3000/shared/mocked-uuid' };

      await snippetController.fetchSharedSnippet(req as Request, res as Response, next);

      expect(Snippet.findOne).toHaveBeenCalledWith({ sharedLink: req.params.link });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'console.log("Hello World");',
        createdAt: mockSnippet.createdAt,
        description: 'Descrição de teste',
        id: 'snippet1',
        language: 'javascript',
        title: 'Snippet Test',
      }));
    });

    it('deve retornar erro se o link do snippet não for válido', async () => {
      (Snippet.findOne as jest.Mock).mockResolvedValue(null);

      req.params = { link: 'invalid-link' };

      await snippetController.fetchSharedSnippet(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Snippet compartilhado não encontrado.',
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
