import nodemailer from 'nodemailer';
import env from './env';

const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org', // Host correto para o Mailgun SMTP
  port: 587, // Porta padrão para STARTTLS
  secure: false,
  auth: {
    user: env.MAILGUN_USER,
    pass: env.MAILGUN_API_KEY,
  },
  tls: {
    rejectUnauthorized: false, // Desativa a verificação do certificado (se necessário)
  },
  logger: true, // Ativa logs detalhados
  debug: true,  // Mostra mensagens de depuração
});

export default transporter;
