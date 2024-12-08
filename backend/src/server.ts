import app from './app';
import env from './config/env';
import './types/';

const PORT = env.PORT || '';

// teste de rota inicial ('/)
app.get('get', (req, res) => {
  res.json({ message: 'API rodando...' });
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
