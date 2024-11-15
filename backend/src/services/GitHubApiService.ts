// src/services/GitHubApiService.ts

import axios from 'axios';

export class GitHubApiService {
  // Mapeamento de extensões de arquivos para nomes de linguagens
  private static languageMap: { [key: string]: string } = {
    js: 'JavaScript',
    py: 'Python',
    java: 'Java',
    cpp: 'C++',
    ts: 'TypeScript',
    rb: 'Ruby',
    php: 'PHP',
    html: 'HTML',
    css: 'CSS',
    md: 'Markdown',
    sh: 'Shell Script',
    txt: 'Texto',
    // Adicione outras extensões conforme necessário
  };

  // Método para buscar snippets públicos com base em uma query (ex.: linguagem, tags)
  static async fetchPublicSnippets(query: string): Promise<any> {
    try {
      // Defina a URL da API externa (exemplo: GitHub Gist API)
      const apiUrl = `https://api.github.com/gists/public?q=${encodeURIComponent(query)}`;

      // Configurações adicionais de headers podem ser adicionadas aqui, se necessário (ex.: Token de autenticação)
      const response = await axios.get(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          // Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // (Opcional) Use um token se a API exigir autenticação
        },
      });

      // Processa os dados retornados pela API e transforma-os no formato desejado
      interface Gist {
        id: string;
        description: string;
        files: {
          [key: string]: {
            content: string;
          };
        };
        created_at: string;
        html_url: string;
      }

      const snippets = (response.data as Gist[]).map((gist: Gist) => {
        const fileName = gist.files ? Object.keys(gist.files)[0] : 'Sem nome';
        const fileData = gist.files[fileName];

        // Identifica a linguagem pela extensão do arquivo
        const extension = fileName.split('.').pop();
        const language = extension ? this.languageMap[extension] || 'Desconhecido' : 'Desconhecida';

        return {
          id: gist.id,
          title: gist.description || 'Sem título',
          language: language,
          code: fileData.content || '',
          createdAt: gist.created_at,
          url: gist.html_url,
        };
      });

      return snippets;
    } catch (error) {
      console.error('Erro ao buscar snippets públicos:', error);
      throw new Error('Erro ao buscar snippets públicos.');
    }
  }
}
