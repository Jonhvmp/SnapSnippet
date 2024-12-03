// utils/validationUtils.ts

import { Response } from 'express';

export const handleValidationError = (res: Response, message: string): void => {
  res.status(400).json({ message });
};
