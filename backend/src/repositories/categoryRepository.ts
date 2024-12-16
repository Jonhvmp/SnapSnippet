import { Category } from "../models/Category";

export const createCategory = (name: string, userId: string, description: string) => {
  return Category.create({ name, user: userId, description });
};

export const findCategoriesByUser = (userId: string) => {
  return Category.find({ user: userId });
};

export const findCategoryById = (id: string) => {
  return Category.findById(id);
};

export const updateCategoryById = (id: string, name: string, description: string) => {
  return Category.findByIdAndUpdate(id, { $set: { name, description } }, { new: true, runValidators: true });
};

export const deleteCategory = (id: string, userId: string) => {
  return Category.findOneAndDelete({ _id: id, user: userId });
}
