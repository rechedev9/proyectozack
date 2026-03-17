import { Resend } from 'resend';
import { env } from './env';

export const resend = new Resend(env.RESEND_API_KEY);

interface ContactEmailPayload {
  name: string;
  email: string;
  type: string;
  company?: string;
  message: string;
}

export async function sendContactEmail(payload: ContactEmailPayload): Promise<void> {
  await resend.emails.send({
    from: 'SocialPro <noreply@socialpro.es>',
    to: 'marketing@socialpro.es',
    subject: `Nuevo contacto: ${payload.name} (${payload.type})`,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Tipo:</strong> ${payload.type}</p>
      ${payload.company ? `<p><strong>Empresa:</strong> ${payload.company}</p>` : ''}
      <hr/>
      <p>${payload.message.replace(/\n/g, '<br/>')}</p>
    `,
  });
}
