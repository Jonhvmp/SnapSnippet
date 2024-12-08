# Guia de Contribuição

Obrigado por se interessar em contribuir para este projeto! Este guia ajudará você a entender como você pode contribuir e as práticas recomendadas para enviar contribuições.

---

## Como Contribuir

### 1. Reportar Problemas (Issues)
Se você encontrou um problema ou tem uma sugestão para melhoria, siga estas etapas:
- Verifique a aba de [Issues](https://github.com/Jonhvmp/SnapSnippet/issues) para garantir que o problema ou sugestão ainda não tenha sido reportado.
- Crie um novo issue e forneça informações detalhadas:
  - Uma descrição clara e objetiva do problema ou sugestão.
  - Passos para reproduzir o problema (se aplicável).
  - Logs ou mensagens de erro (se relevante).
  - Informações adicionais, como ambiente de desenvolvimento (versão do sistema, navegador, etc.).

### 2. Enviar Melhorias ou Correções de Código (Pull Requests)
Se você deseja corrigir um bug ou adicionar uma nova funcionalidade:
1. Faça um **fork** do repositório.
2. Crie uma nova branch para sua contribuição:
   ```
   git checkout -b feature/nome-da-feature
   ```
3. Faça suas alterações no código.
4. Garanta que você seguiu as práticas de codificação descritas neste guia.
5. Teste suas alterações localmente antes de enviar.
6. Envie suas alterações:
   ```
   git commit -m "Descrição clara das alterações"
   git push origin feature/nome-da-feature
   ```
7. Abra um **Pull Request** no repositório principal.

Certifique-se de descrever o que você fez, incluindo o motivo e detalhes técnicos. Relacione qualquer **issue** que sua contribuição resolva, se aplicável.

### 3. Revisar e Testar Código
Você pode ajudar revisando Pull Requests abertos. Leia atentamente o código, teste-o localmente e deixe feedback construtivo para o autor.

---

## Padrões de Código

### Estilo de Código
Este projeto segue os seguintes padrões:
- **Linting**: Execute o linter antes de enviar suas alterações:
  ```
  npm run lint
  ```
- **Formatação**: Use [Prettier](https://prettier.io/) ou outro formatter especificado no projeto.
- **Commits**: Siga as convenções de commit. Use mensagens claras e concisas, por exemplo:
  - `feat`: Adiciona uma nova funcionalidade.
  - `fix`: Corrige um bug.
  - `docs`: Atualiza documentação.
  - `refactor`: Melhora o código sem alterar a funcionalidade.
  - `test`: Adiciona ou corrige testes.

### Testes
- Certifique-se de que todos os testes existentes passem antes de enviar o código:
  ```
  npm test
  ```
- Adicione testes para quaisquer novas funcionalidades ou correções.

---

## Comunicação e Suporte

- **Dúvidas**: Se você tiver dúvidas sobre como contribuir, sinta-se à vontade para abrir um **Discussion** no repositório ou entrar em contato com a equipe em [jasolutionsengine@gmail.com](mailto:jasolutionsengine@gmail.com).
- **Respeito e Colaboração**: Lembre-se de seguir nosso [Código de Conduta](./CODE_OF_CONDUCT.md) em todas as interações.

---

## Processos de Revisão

Todas as contribuições passarão por uma revisão feita por membros do projeto antes de serem aceitas. Durante a revisão:
- Seja receptivo a feedbacks.
- Atualize sua contribuição conforme necessário.
- Mantenha uma comunicação aberta e respeitosa com os revisores.

---

## Reconhecimentos

Contribuidores são reconhecidos por suas contribuições no repositório, seja através de commits, issues, revisões ou discussões. Muito obrigado por tornar este projeto melhor!

---

Obrigado por sua contribuição! 🎉
