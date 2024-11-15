// src/config/database.ts - Conexão e configuração do banco de dados com o MongoDB
import mongoose, { ConnectOptions } from "mongoose";
import env from './env';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log("Database conectado!");
  } catch (error) {
    console.log("Erro ao conectar ao database!", error);
  }
};
