import rateLimit from "express-rate-limit";

// Limite de requisições por IP
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: 'Você atingiu o limite de requisições. Por favor, tente novamente em 15 minutos.',
});

// Limite de requisições por usuário autenticado
export const authenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // 500 requisições
  message: 'Você atingiu o limite de requisições. Por favor, tente novamente em 15 minutos.',
});
