// src/services/GitHubApiService.ts

import axios from 'axios';
import env from '../config/env'
export class GitHubApiService {
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
  };

  // Método para buscar snippets públicos
  static async fetchPublicSnippets(query: string): Promise<any> {
    try {
      const apiUrl = `https://api.github.com/gists/public?q=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${env.GITHUB_TOKEN}`, // Token de acesso do GitHub
        },
      });

      const gistPromises = (response.data as any).map(async (gist: any) => {
        const fileName = gist.files ? Object.keys(gist.files)[0] : 'Sem nome';
        const extension = fileName.split('.').pop();
        const language = extension ? this.languageMap[extension] || 'Desconhecido' : 'Desconhecida';

        const gistDetail = await axios.get(`https://api.github.com/gists/${gist.id}`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${env.GITHUB_TOKEN}`, // Token de acesso do GitHub
          },
        });

        const completeFileData = (gistDetail.data as any).files[fileName];
        const fileContent = completeFileData ? completeFileData.content : '';

        return {
          id: gist.id,
          title: gist.description || 'Sem título',
          language: language,
          code: fileContent,
          createdAt: gist.created_at,
          url: gist.html_url,
        };
      });

      const snippets = await Promise.all(gistPromises);
      return snippets;
    } catch (error) {
      console.error('Erro ao buscar snippets públicos:', error);
      throw new Error('Erro ao buscar snippets públicos.');
    }
  }
}
