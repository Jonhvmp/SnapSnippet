// src/models/Token.ts
import { Schema, model, Document } from 'mongoose';

// Interface para tipagem TypeScript
export interface IToken extends Document {
  userId: Schema.Types.ObjectId; // Referência ao ID do usuário
  token: string; // Hash do token
  expiresAt: Date; // Data de expiração do token
}

// Schema do Token
const TokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Relacionamento com o modelo User
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

// Middleware para excluir tokens expirados automaticamente
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Exporta o modelo Token
export const Token = model<IToken>('Token', TokenSchema);
