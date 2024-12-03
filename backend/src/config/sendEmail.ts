import transporter from './mailgunClient';
import env from './env';

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    const mailOptions = {
      from: `JA Solutions Engine <${env.MAILGUN_FROM}>`, // Use um endereço de remetente verificado
      to, // Destinatário
      subject, // Assunto do e-mail
      html, // Corpo do e-mail em HTML
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email enviado para ${to}`);
  } catch (error) {
    console.error(`Erro ao enviar email para ${to}:`, error);
    throw new Error(`Falha ao enviar email: ${(error as Error).message}`);
  }
};
