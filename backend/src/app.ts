import express, { Request, Response } from 'express';
import { registerUser, loginUser } from './controllers/authController';
import { validateToken } from './middlewares/authMiddleware';
// import { updatePassword } from './controllers/userController';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { connectDB } from './config/database'
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

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

app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.post('/api/auth/password', validateToken);

app.use(errorMiddleware);

export default app;
