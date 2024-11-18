import express from 'express';
import { registerUser, loginUser } from './controllers/authController';
import { validateToken } from './middlewares/authMiddleware';
// import { updatePassword } from './controllers/userController';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express();

app.use(express.json());

app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.post('/api/auth/password', validateToken);

app.use(errorMiddleware);

export default app;
