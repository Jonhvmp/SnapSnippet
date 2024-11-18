// src/config/database.ts - Conexão e configuração do banco de dados com o MongoDB
import mongoose, { ConnectOptions } from "mongoose";
import dotenv from 'dotenv'

dotenv.config();

// console.log("MONGODB_URI do env:", process.env.MONGODB_URI);

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    } as ConnectOptions);
    console.log("Database conectado!");
  } catch (error) {
    console.log("Erro ao conectar ao database!", error);
  }
  // console.log(process.env.MONGODB_URI);
};
