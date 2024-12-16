import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/snnipets/categoryService';

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const category = await categoryService.createNewCategory(name, description, userId);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const categories = await categoryService.getUserCategories(userId);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const category = await categoryService.updateCategory(id, name, description, userId);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const result = await categoryService.removeCategory(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
