import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  user: Schema.Types.ObjectId; // Referência ao usuário
  _id: Schema.Types.ObjectId; // Referência ao ID da categoria
  description: string;
  createdAt: Date;
}

const CategorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Nome da categoria é obrigatório.'],
    trim: true,
    minLength: [3, 'Nome da categoria deve ter no mínimo 3 caracteres.'],
    maxLength: [50, 'Nome da categoria deve ter no máximo 50 caracteres.'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    trim: true,
    maxLength: [255, 'Descrição da categoria deve ter no máximo 255 caracteres.'],
    },
  },
  { timestamps: true }
);

export const Category = model<ICategory>('Category', CategorySchema);
