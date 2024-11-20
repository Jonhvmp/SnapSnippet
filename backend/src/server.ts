import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || '';

// teste de rota inicial ('/)
app.get('get', (req, res) => {
  res.json({ message: 'API rodando...' });
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
