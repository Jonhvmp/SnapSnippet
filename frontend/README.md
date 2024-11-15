frontend/
├── node_modules/
├── public/
│   └── ... (arquivos públicos como imagens, ícones, etc.)
├── src/
│   ├── app/
│   │   ├── About/                   // Pasta para a página "About" (Rota "/about")
│   │   │   ├── page.tsx             // Página principal da rota "About"
│   │   │   └── layout.tsx           // Layout específico para a rota "About" (opcional)
│   │   ├── dashboard/               // Pasta para a página "Dashboard" (Rota "/dashboard")
│   │   │   ├── page.tsx             // Página principal da rota "Dashboard"
│   │   │   ├── settings/            // Sub-rota "/dashboard/settings"
│   │   │   │   └── page.tsx         // Página de configurações dentro de "Dashboard"
│   │   │   └── analytics/           // Sub-rota "/dashboard/analytics"
│   │   │       └── page.tsx         // Página de analytics dentro de "Dashboard"
│   │   ├── favicon.ico
│   │   ├── globals.css              // Estilos globais
│   │   ├── layout.tsx               // Layout global (aplicado a todas as rotas)
│   │   └── page.tsx                 // Página principal (Rota "/")
│   ├── components/                  // Componentes reutilizáveis
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── SnippetCard.tsx
│   │   └── ... (outros componentes)
│   ├── styles/                      // Arquivos de estilo adicionais
│   │   ├── globals.css
│   │   ├── variables.css            // Variáveis CSS (opcional)
│   │   └── layout.css               // Estilos para layout (opcional)
│   ├── hooks/                       // Custom Hooks
│   │   ├── useAuth.ts               // Exemplo de hook para autenticação
│   │   └── useFetch.ts              // Exemplo de hook para requisições
│   ├── context/                     // Contextos globais
│   │   └── AuthContext.tsx          // Contexto para autenticação
│   ├── services/                    // Serviços e lógica de API
│   │   └── apiService.ts            // Exemplo de serviço de API
│   └── utils/                       // Funções utilitárias
│       └── helpers.ts               // Funções auxiliares
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json
