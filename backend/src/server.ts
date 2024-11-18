import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || '';

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
