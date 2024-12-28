import express, { Request, Response, NextFunction } from 'express';
import authRoutes from './routes/authRoutes';
import snippetRoutes from './routes/snippetRoutes';
// import { userRoutes } from './routes/userRoutes';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { connectDB } from './config/database'
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

const app = express();

// Conexão com o banco de dados - MongoDb
connectDB();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.56.1:3000'],
  credentials: true, // Permitir envio de cookies
}));

// passando tipagem na rota ('/)
app.get('/', (req: Request, res: Response): void => {
  res.json({ message: 'API rodando...' });
});

app.use('/api/auth', authRoutes);
// app.use('/users', userRoutes);

app.use('/api/snippets', snippetRoutes);

// Passando uma mensagem dinâmica para o middleware de erro
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.use(errorMiddleware);

export default app;
