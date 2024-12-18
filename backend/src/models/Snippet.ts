import { Schema, model, Document } from 'mongoose';
import sanitizeHtml from 'sanitize-html';

// Interface para tipagem TypeScript
export interface ISnippet extends Document {
  title: string;
  description: string;
  language: string;
  tags: string[];
  user: Schema.Types.ObjectId;
  code: string;
  favorite: boolean;
  category: Schema.Types.ObjectId | null;
  sharedLink: string | null;
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
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    sharedLink: {
      type: String,
      // default: null, // Indica que o snippet não é compartilhado inicialmente
      unique: true,
      sparse: true,  // Permite valores nulos e únicos
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

// Middleware para sanitizar o campo "code" e evitar ataques
SnippetSchema.pre<ISnippet>('save', function (next) {
  // Sanitize the code field using sanitize-html
  this.code = sanitizeHtml(this.code, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
    allowedAttributes: {
      '*': [ 'style', 'class' ],
      'a': [ 'href', 'name', 'target' ],
      'img': [ 'src' ]
    },
    allowedSchemes: [ 'http', 'https', 'ftp', 'mailto', 'tel' ],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
    allowProtocolRelative: true,
    enforceHtmlBoundary: true
  });
  next();
});

export const Snippet = model<ISnippet>('Snippet', SnippetSchema);
