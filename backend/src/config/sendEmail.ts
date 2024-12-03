// src/config/sendEmail.ts
import mailgunClient from './mailgunClient';
import env from './env';

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    const data = {
      from: `JA Solutions Engine <postmaster@${env.MAILGUN_DOMAIN}>`, // Remetente verificado no Mailgun
      to, // Destinatário
      subject, // Assunto do e-mail
      html, // Corpo do e-mail
    };

    // Use a API do Mailgun para enviar o e-mail
    const response = await mailgunClient.messages.create(env.MAILGUN_DOMAIN, data);
    console.log(`Email enviado para ${to}`, response);
  } catch (error) {
    console.error(`Erro ao enviar e-mail para ${to}:`, error);
    throw new Error(`Falha ao enviar e-mail: ${(error as any).message}`);
  }
};
