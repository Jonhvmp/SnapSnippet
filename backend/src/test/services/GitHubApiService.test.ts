import axios from 'axios';
import { GitHubApiService } from '../../services/github/GitHubApiService';
import env from '../../config/env';

// Mock do axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GitHubApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Silencia logs de erro
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restaura comportamento original dos mocks
  });

  describe('fetchPublicSnippets', () => {
    it('deve retornar snippets públicos formatados corretamente', async () => {
      const mockGistResponse = [
        {
          id: '12345',
          description: 'Teste Snippet',
          created_at: '2024-12-06T10:00:00Z',
          html_url: 'https://gist.github.com/12345',
          files: {
            'test.js': {
              filename: 'test.js',
            },
          },
        },
      ];

      const mockGistDetailResponse = {
        files: {
          'test.js': {
            content: 'console.log("Hello World");',
          },
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockGistResponse }) // Resposta inicial de gists
        .mockResolvedValueOnce({ data: mockGistDetailResponse }); // Detalhes do gist

      const query = 'javascript';
      const result = await GitHubApiService.fetchPublicSnippets(query);

      expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Uma para gists públicos, outra para detalhes
      expect(result).toEqual([
        {
          id: '12345',
          title: 'Teste Snippet',
          language: 'JavaScript',
          code: 'console.log("Hello World");',
          createdAt: '2024-12-06T10:00:00Z',
          url: 'https://gist.github.com/12345',
        },
      ]);
    });

    it('deve retornar erro se a API do GitHub falhar', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Erro na API do GitHub'));

      await expect(GitHubApiService.fetchPublicSnippets('javascript')).rejects.toThrow(
        'Erro ao buscar snippets públicos.'
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('deve retornar linguagem "Desconhecida" para arquivos sem extensão', async () => {
      const mockGistResponse = [
        {
          id: '67890',
          description: 'Sem extensão',
          created_at: '2024-12-06T10:00:00Z',
          html_url: 'https://gist.github.com/67890',
          files: {
            'testfile': {}, // Arquivo sem extensão
          },
        },
      ];

      const mockGistDetailResponse = {
        files: {
          'testfile': {
            content: 'Arquivo sem extensão',
          },
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockGistResponse }) // Resposta inicial
        .mockResolvedValueOnce({ data: mockGistDetailResponse }); // Detalhes

      const result = await GitHubApiService.fetchPublicSnippets('sem extensao');

      expect(result).toEqual([
        {
          id: '67890',
          title: 'Sem extensão',
          language: 'Desconhecida',
          code: 'Arquivo sem extensão',
          createdAt: '2024-12-06T10:00:00Z',
          url: 'https://gist.github.com/67890',
        },
      ]);
    });
  });
});
