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

export async function sendBrandInviteEmail(payload: {
  brandEmail: string;
  brandName: string;
  resetUrl: string;
}): Promise<void> {
  await resend.emails.send({
    from: 'SocialPro <noreply@socialpro.es>',
    to: payload.brandEmail,
    subject: 'Bienvenido al Portal de Marcas — SocialPro',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase;">
          Portal de Marcas
        </h2>
        <p>Hola <strong>${payload.brandName}</strong>,</p>
        <p>Has sido invitado al Portal de Marcas de SocialPro. Accede a nuestro roster de talentos, revisa metricas de campanas y envia propuestas directamente.</p>
        <p>
          <a href="${payload.resetUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%);color:#fff;text-decoration:none;border-radius:9999px;font-weight:bold;">
            Establecer contrasena
          </a>
        </p>
        <p style="color: #6b6864; font-size: 13px;">Si no esperabas este email, puedes ignorarlo.</p>
      </div>
    `,
  });
}
