import dotenv from 'dotenv';
// Carregar as variáveis de ambiente do arquivo .env
dotenv.config();
// Definir a tipagem das variáveis de ambiente
interface Env {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  GITHUB_TOKEN: string;
  MAILGUN_API_KEY: string;
  MAILGUN_DOMAIN: string;
  MAILGUN_USER: string;
  MAILGUN_FROM: string;
}

// Criar uma função para fazer a conversão das variáveis de ambiente e definir valores padrão
const getEnv = (): Env => {
  return {
    PORT: parseInt(process.env.PORT || '8008', 10),
    MONGODB_URI: process.env.MONGODB_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || '',
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || '',
    MAILGUN_USER: process.env.MAILGUN_USER || '',
    MAILGUN_FROM: process.env.MAILGUN_FROM || '',
  };
};

// Exportar as variáveis de ambiente para serem usadas em outras partes do projeto
const env = getEnv();
export default env;
