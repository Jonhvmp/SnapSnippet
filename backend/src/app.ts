import express, { Request, Response, NextFunction } from 'express';
import authRoutes from './routes/authRoutes';
import snippetRoutes from './routes/snippetRoutes';
// import { userRoutes } from './routes/userRoutes';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { connectDB } from './config/database'
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authenticatedLimiter, limiter } from './utils/rateLimiting';

const app = express();

// Conexão com o banco de dados - MongoDb
connectDB();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// passando tipagem na rota ('/)
app.get('/', (req: Request, res: Response): void => {
  res.json({ message: 'API rodando...' });
});

app.use('/api/auth', authRoutes);
// app.use('/users', userRoutes);

app.use('/api/snippets', snippetRoutes);

app.use(limiter); // Aplicando o rate limiter
app.use('/api', authenticatedLimiter) // Aplicando o rate limiter apenas para rotas autenticadas

// Passando uma mensagem dinâmica para o middleware de erro
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.use(errorMiddleware);

export default app;
