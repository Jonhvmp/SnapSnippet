// src/config/sendEmail.ts

import nodemailer from 'nodemailer';
import env from './env';
import { NextFunction } from 'express';

// Função para enviar email
export const sendEmail = async (to: string, subject: string, html: string, next: NextFunction): Promise<void> => {
  try {
    // Configuração do transporte SMTP do testmail.app
    const transporter = nodemailer.createTransport({
      host: 'smtp.testmail.app',
      port: 587,
      auth: {
        user: env.MAILTRAP_USER,
        pass: env.MAILTRAP_PASSWORD,
      },
    });

    // configuração da mensagem
    const mailOptions = {
      from: '"JA Solutions Engine" <no-reply@testmail.app>', // remetente
      to, // destinatário
      subject, // assunto
      html, // corpo do email
    };

    // Envio do email
    await transporter.sendMail(mailOptions);
    console.log(`Email enviado para ${to}`);
  } catch (error) {
    next(error); // Passa o erro para o próximo middleware
  }
}
