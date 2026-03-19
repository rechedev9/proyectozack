import { Resend } from 'resend';
import { env } from './env';

export const resend = new Resend(env.RESEND_API_KEY);

/** Escape user-supplied strings before embedding in HTML email templates. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

interface ContactEmailPayload {
  name: string;
  email: string;
  type: string;
  company?: string;
  message: string;
}

export async function sendContactEmail(payload: ContactEmailPayload): Promise<void> {
  const name = escapeHtml(payload.name);
  const email = escapeHtml(payload.email);
  const type = escapeHtml(payload.type);
  const company = payload.company ? escapeHtml(payload.company) : '';
  const message = escapeHtml(payload.message).replace(/\n/g, '<br/>');

  await resend.emails.send({
    from: 'SocialPro <noreply@socialpro.es>',
    to: 'marketing@socialpro.es',
    subject: `Nuevo contacto: ${name} (${type})`,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Tipo:</strong> ${type}</p>
      ${company ? `<p><strong>Empresa:</strong> ${company}</p>` : ''}
      <hr/>
      <p>${message}</p>
    `,
  });
}

export async function sendBrandInviteEmail(payload: {
  brandEmail: string;
  brandName: string;
  resetUrl: string;
}): Promise<void> {
  const brandName = escapeHtml(payload.brandName);
  // Only allow HTTPS URLs for the reset link
  const resetUrl = payload.resetUrl.startsWith('https://') || payload.resetUrl.startsWith('http://localhost')
    ? payload.resetUrl
    : '#';

  await resend.emails.send({
    from: 'SocialPro <noreply@socialpro.es>',
    to: payload.brandEmail,
    subject: 'Bienvenido al Portal de Marcas — SocialPro',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase;">
          Portal de Marcas
        </h2>
        <p>Hola <strong>${brandName}</strong>,</p>
        <p>Has sido invitado al Portal de Marcas de SocialPro. Accede a nuestro roster de talentos, revisa metricas de campanas y envia propuestas directamente.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%);color:#fff;text-decoration:none;border-radius:9999px;font-weight:bold;">
            Establecer contrasena
          </a>
        </p>
        <p style="color: #6b6864; font-size: 13px;">Si no esperabas este email, puedes ignorarlo.</p>
      </div>
    `,
  });
}
