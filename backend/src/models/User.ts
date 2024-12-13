// src/models/User.ts
import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

// Interface para tipagem TypeScript
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  loginAttempts: number;
  lockUntil: Date | null;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  incrementLoginAttempts: () => Promise<void>;
  isLocked: () => boolean;
}

// Schema do Usuário com validações avançadas
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'O nome de usuário é obrigatório.'],
      trim: true,
      unique: true,
      minlength: [3, 'O nome de usuário deve ter pelo menos 3 caracteres.'],
      maxlength: [50, 'O nome de usuário deve ter no máximo 50 caracteres.'],
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório.'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => validator.isEmail(email),
        message: 'E-mail inválido.',
      },
    },
    password: {
      type: String,
      required: [true, 'A senha é obrigatória.'],
      minlength: [8, 'A senha deve ter pelo menos 8 caracteres.'],
      maxlength: [128, 'A senha deve ter no máximo 128 caracteres.'],
      select: false, // Exclui o campo da senha nas consultas por padrão
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adiciona campos createdAt e updatedAt automaticamente
  }
);

// Middleware para hash da senha antes de salvar
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

console.log('Hash da senha (UserSchema):', UserSchema);

// Método para comparar a senha informada com o hash armazenado
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para incrementar tentativas de login
UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  if (this.isLocked()) {
    return; // Não incrementa se já está bloqueado
  }

  this.loginAttempts += 1;

  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Bloqueia por 30 minutos
  }

  await this.save();
};

// Verifica se o usuário está bloqueado
UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Método para prevenir ataques DoS no login, omitindo erro específico
interface MongoServerError extends Error {
  name: string;
  code: number;
}

UserSchema.post('insertMany', function (error: any, doc: IUser, next: (err?: Error) => void) {
  if (error.name === 'MongoServerError' && error.code === 11000) { // 'MongoServerError' e código 11000 indicam duplicidade
    next(new Error('O e-mail ou nome de usuário já está em uso.'));
  } else {
    next(error);
  }
});

export const User = model<IUser>('User', UserSchema); // Exporta o modelo de Usuário
