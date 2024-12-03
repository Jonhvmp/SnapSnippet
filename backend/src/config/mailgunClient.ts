// src/config/mailgunClient.ts
import mailgun from 'mailgun.js';
import formData from 'form-data';
import env from './env';

const mg = new mailgun(formData);

const mailgunClient = mg.client({
  username: 'api',
  key: env.MAILGUN_API_KEY, // Use sua API Key
});

export default mailgunClient;
