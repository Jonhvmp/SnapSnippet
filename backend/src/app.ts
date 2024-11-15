// src/app.ts

import express from 'express';
import snippetRoutes from './routes/snippetRoutes';

const app = express();

// Outras configurações do app, como middleware de parsing JSON
app.use(express.json());

// rota de teste '/'
app.get('/', (req, res) => {
  res.send('API de snippets funcionando!');
})

// Rota de snippets
app.use('/api/snippets', snippetRoutes); // criado apenas para testes no momento

export default app;
