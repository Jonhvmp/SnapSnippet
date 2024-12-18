// src/models/Token.ts
import { Schema, model, Document, Types } from 'mongoose';

// Interface para tipagem TypeScript
export interface IToken extends Document {
  _id: Types.ObjectId; // Adicione esta linha
  userId: Types.ObjectId; // Alterar para Types.ObjectId
  token: string;
  sessionId: string;
  expiresAt: Date;
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
    sessionId: {
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

// Middleware para logar a criação de um token
TokenSchema.post('save', { document: true, query: false }, function (doc: IToken) {
  console.log(`Token criado: ${doc._id}`);
});

// Middleware para logar a exclusão de um token
TokenSchema.post('deleteOne', { document: true, query: false }, function (doc: IToken) {
  console.log(`Token removido: ${doc._id}`);
});

// Exporta o modelo Token
export const Token = model<IToken>('Token', TokenSchema);
