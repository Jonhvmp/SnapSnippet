// src/config/sendEmail.ts

import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import env from './env';

// Cria o transporte SMTP uma única vez para reutilização
const transporter: Transporter = nodemailer.createTransport({
  host: 'smtp.testmail.app',
  port: 587,
  auth: {
    user: env.TESTMAIL_USER,
    pass: env.TESTMAIL_KEY,
  },
  // Timeout configurado para evitar pendências em conexões lentas
  timeout: 5000,
} as SMTPTransport.Options);

/**
 * Função para enviar email
 * @param to - Endereço do destinatário
 * @param subject - Assunto do email
 * @param html - Corpo do email em formato HTML
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    // Validação de argumentos
    if (!to || !subject || !html) {
      throw new Error('Os campos "to", "subject" e "html" são obrigatórios');
    }

    const mailOptions = {
      from: '"JA Solutions Engine" <no-reply@testmail.app>', // Remetente
      to, // Destinatário
      subject, // Assunto
      html, // Corpo do email
    };

    // Envio do email
    await transporter.sendMail(mailOptions);
    console.log(`Email enviado para ${to}`);
  } catch (error) {
    // Logs detalhados do erro
    console.error(`Erro ao enviar email para ${to}:`, error || Error);

    // Lança o erro com mais contexto
    throw new Error(`Falha ao enviar email: ${(error as Error).message}`);
  }
};
