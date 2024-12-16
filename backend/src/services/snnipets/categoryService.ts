import * as categoryRepository from '../../repositories/categoryRepository';

export const createNewCategory = async (name: string, description: string, userId: string) => {
  if (!name) {
    throw new Error('O nome da categoria é obrigatório.');
  }

  if (name.length < 3 || name.length > 50) {
    throw new Error('O nome da categoria deve ter entre 3 e 50 caracteres.');
  }

  if (description && description.length > 255) {
    throw new Error('A descrição da categoria deve ter no máximo 255 caracteres.');
  }

  // Verificar se a categoria já existe para o usuário
  const existingCategories = await categoryRepository.findCategoriesByUser(userId);
  const isDuplicate = existingCategories.some((category) => category.name === name);

  if (isDuplicate) {
    throw new Error('Uma categoria com esse nome já existe.');
  }

  return categoryRepository.createCategory(name, userId, description);
};

export const getUserCategories = (userId: string) => {
  if (!userId) {
    throw new Error('ID do usuário é obrigatório.');
  }
  return categoryRepository.findCategoriesByUser(userId);
};

export const updateCategory = async (
  id: string,
  name: string,
  description: string,
  userId: string
) => {
  if (!name) {
    throw new Error('O nome da categoria é obrigatório.');
  }

  if (name.length < 3 || name.length > 50) {
    throw new Error('O nome da categoria deve ter entre 3 e 50 caracteres.');
  }

  if (description && description.length > 255) {
    throw new Error('A descrição da categoria deve ter no máximo 255 caracteres.');
  }

  // Garantir que não exista outra categoria com o mesmo nome para o usuário
  const categories = await categoryRepository.findCategoriesByUser(userId);
  const isDuplicate = categories.some((category) => category.name === name && category._id.toString() !== id);

  if (isDuplicate) {
    throw new Error('Uma categoria com esse nome já existe.');
  }

  return categoryRepository.updateCategoryById(id, name, description);
};

export const removeCategory = async (id: string, userId: string) => {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw new Error('Categoria não encontrada.');
  }

  if (category.user.toString() !== userId) {
    throw new Error('Você não tem permissão para deletar esta categoria.');
  }

  return categoryRepository.deleteCategory(id, userId);
};

export const getCategoryById = async (id: string, userId: string) => {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw new Error('Categoria não encontrada.');
  }

  if (category.user.toString() !== userId) {
    throw new Error('Você não tem permissão para visualizar esta categoria.');
  }

  return category;
};
