// src/models/Snippet.ts
import { Schema, model, Document } from 'mongoose';

// Interface para tipagem TypeScript
export interface ISnippet extends Document {
  title: string;
  description: string;
  language: string;
  tags: string[];
  code: string;
  favorite: boolean;
  createdAt: Date;
}

// Schema do Snippet com validações avançadas
const SnippetSchema = new Schema<ISnippet>(
  {
    title: {
      type: String,
      required: [true, 'O título é obrigatório.'],
      trim: true,
      minlength: [3, 'O título deve ter pelo menos 3 caracteres.'],
      maxlength: [100, 'O título deve ter no máximo 100 caracteres.'],
    },
    description: {
      type: String,
      required: [true, 'A descrição é obrigatória.'],
      trim: true,
      minlength: [5, 'A descrição deve ter pelo menos 5 caracteres.'],
      maxlength: [500, 'A descrição deve ter no máximo 500 caracteres.'],
    },
    language: {
      type: String,
      required: [true, 'A linguagem é obrigatória.'],
      enum: {
        values: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Ruby', 'PHP', 'HTML', 'CSS'],
        message: 'Linguagem não suportada.',
      },
    },
    tags: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 10;
        },
        message: 'No máximo 10 tags são permitidas.',
      },
      default: [],
    },
    code: {
      type: String,
      required: [true, 'O código é obrigatório.'],
      minlength: [1, 'O código não pode estar vazio.'],
      maxlength: [10000, 'O código deve ter no máximo 10.000 caracteres.'],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para verificar e sanitizar o campo "code" contra injeções de código potencialmente perigosas
SnippetSchema.pre<ISnippet>('save', function (next) {
  // Sanitização ou ajustes necessários podem ser implementados aqui
  this.code = this.code.replace(/<script>/g, '&lt;script&gt;');
  this.code = this.code.replace(/<\/script>/g, '&lt;/script&gt;');
  this.code = this.code.replace(/<iframe>/g, '&lt;iframe&gt;');
  this.code = this.code.replace(/<\/iframe>/g, '&lt;/iframe&gt;');
  this.code = this.code.replace(/<img>/g, '&lt;img&gt;');
  this.code = this.code.replace(/<\/img>/g, '&lt;/img&gt;');
  next();

  // Exemplo de sanitização
  // this.code = this.code.replace(/<script>/g, '&lt;script&gt;');
  // this.code = this.code.replace(/<\/script>/g, '&lt;/script&gt;');
  // next();
});

export const Snippet = model<ISnippet>('Snippet', SnippetSchema);
