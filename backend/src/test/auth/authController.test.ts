import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword } from '../../controllers/authController';
import { User } from '../../models/User';
import { Token } from '../../models/Token';
import { sendEmail } from '../../config/sendEmail';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependências
jest.mock('../../models/User');
jest.mock('../../models/Token');
jest.mock('../../config/sendEmail');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {}, params: {}, protocol: 'http', get: jest.fn().mockReturnValue('localhost:3000') };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('registerUser', () => {
    it('deve retornar erro se campos obrigatórios estiverem ausentes', async () => {
      req.body = { username: '', email: '', password: '', confirmPassword: '' };

      await registerUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Todos os campos são obrigatórios',
      });
    });

    it('deve registrar usuário com sucesso', async () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const mockSave = jest.fn().mockResolvedValue({ id: '12345' });
      (User as jest.MockedClass<typeof User>).mockImplementation(() => ({ save: mockSave } as any));

      await registerUser(req as Request, res as Response, next);

      expect(User.findOne).toHaveBeenCalledTimes(2); // Verifica email e username
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Usuário registrado com sucesso' })
      );
    });
  });

  describe('loginUser', () => {
    it('deve retornar erro se credenciais estiverem ausentes', async () => {
      req.body = { email: '', password: '' };

      await loginUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Todos os campos são obrigatórios',
      });
    });

    it('deve retornar erro se credenciais forem inválidas', async () => {
      req.body = { email: 'invalid@example.com', password: 'wrongpassword' };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await loginUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Credenciais inválidas',
      });
    });
  });

  describe('forgotPassword', () => {
    it('deve retornar erro se e-mail estiver ausente', async () => {
      req.body = { email: '' };

      await forgotPassword(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'O e-mail é obrigatório',
      });
    });

    it('deve enviar e-mail de redefinição com sucesso', async () => {
      req.body = { email: 'test@example.com' };

      // Mock para User.findOne
      (User.findOne as jest.Mock).mockResolvedValue({
        _id: '12345',
        username: 'testuser',
        email: 'test@example.com',
      });

      const mockSave = jest.fn().mockResolvedValue({});
      (Token as jest.MockedClass<typeof Token>).mockImplementation(() => ({ save: mockSave } as any));

      await forgotPassword(req as Request, res as Response, next);

      // Validação ajustada
      expect(User.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          email: {
            "$eq": 'test@example.com'
            }
        })
      );

      expect(mockSave).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Redefinição de Senha',
        expect.any(String)
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'E-mail de redefinição de senha enviado com sucesso' })
      )
    });

    describe('resetPassword', () => {
      it('deve retornar erro se token for inválido', async () => {
        req.params = { token: 'invalidToken' };
        req.body = { password: 'password123', confirmPassword: 'password123' };

        (Token.findOne as jest.Mock).mockResolvedValue(null);

        await resetPassword(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Token inválido ou expirado',
        })
      })


      it('deve redefinir a senha com sucesso', async () => {
        req.params = { token: 'validToken' };
        req.body = { password: 'password123', confirmPassword: 'password123' };

        const mockToken = { userId: '12345', _id: 'tokenId' };
        const mockUser = { save: jest.fn(), password: 'hashedPassword' };

        (Token.findOne as jest.Mock).mockResolvedValue(mockToken);
        (User.findById as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

        await resetPassword(req as Request, res as Response, next);

        expect(User.findById).toHaveBeenCalledWith('12345');
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(mockUser.save).toHaveBeenCalled();
        expect(Token.deleteOne).toHaveBeenCalledWith({ _id: 'tokenId' });
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });
  });
});
