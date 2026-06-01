import nodemailer, { Transporter } from 'nodemailer';

/**
 * Email service (nodemailer).
 *
 * If SMTP credentials are not configured the service runs in "log only" mode:
 * it logs the message it *would* have sent instead of throwing, so the MVP
 * works end-to-end without a real SMTP server. Errors during sending are
 * swallowed and logged — email delivery must never break the booking flow.
 */

let transporter: Transporter | null = null;
let transporterReady = false;

function getTransporter(): Transporter | null {
  if (transporterReady) return transporter;
  transporterReady = true;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  // Support both SMTP_PASS (prompt) and SMTP_PASSWORD (legacy .env.example).
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.warn('[email] SMTP not configured — running in log-only mode.');
    transporter = null;
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: { user, pass },
  });

  return transporter;
}

const FROM =
  process.env.EMAIL_FROM ||
  process.env.SMTP_FROM ||
  'MICE Hotels <noreply@micehotel.com>';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const tx = getTransporter();

  if (!tx) {
    console.info(
      `[email:log-only] To: ${options.to} | Subject: ${options.subject}`
    );
    return;
  }

  try {
    await tx.sendMail({
      from: FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.info(`[email] Sent "${options.subject}" to ${options.to}`);
  } catch (err) {
    console.error('[email] Failed to send email:', err);
  }
}

const money = (value: number | string | null | undefined): string => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(num);
};

const layout = (title: string, body: string): string => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
    <h2 style="color: #1565c0;">${title}</h2>
    ${body}
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
    <p style="font-size: 12px; color: #888;">MICE Hotel Constructor — автоматическое уведомление, отвечать на него не нужно.</p>
  </div>
`;

// ---------------------------------------------------------------------------
// Trigger helpers
// ---------------------------------------------------------------------------

export async function notifyClientSubmitted(
  to: string,
  bookingId: string,
  eventName?: string | null
): Promise<void> {
  const ref = eventName ? `«${eventName}»` : `#${bookingId.slice(0, 8)}`;
  await sendEmail({
    to,
    subject: `Заявка ${ref} получена`,
    html: layout(
      'Ваша заявка получена',
      `<p>Спасибо! Заявка ${ref} принята в обработку.</p>
       <p>Наш менеджер свяжется с вами в течение 1 рабочего дня.</p>`
    ),
  });
}

export async function notifyClientConfirmed(
  to: string,
  bookingId: string,
  totalPrice: number | string | null | undefined,
  eventName?: string | null
): Promise<void> {
  const ref = eventName ? `«${eventName}»` : `#${bookingId.slice(0, 8)}`;
  await sendEmail({
    to,
    subject: `Заявка ${ref} одобрена`,
    html: layout(
      'Ваша заявка одобрена',
      `<p>Заявка ${ref} одобрена.</p>
       <p><strong>Итоговая сумма: ${money(totalPrice)}</strong></p>`
    ),
  });
}

export async function notifyClientCancelled(
  to: string,
  bookingId: string,
  reason?: string | null,
  eventName?: string | null
): Promise<void> {
  const ref = eventName ? `«${eventName}»` : `#${bookingId.slice(0, 8)}`;
  await sendEmail({
    to,
    subject: `Заявка ${ref} отклонена`,
    html: layout(
      'Ваша заявка отклонена',
      `<p>К сожалению, заявка ${ref} была отклонена.</p>
       ${reason ? `<p><strong>Причина:</strong> ${reason}</p>` : ''}`
    ),
  });
}

export async function notifyManagerNewBooking(
  to: string,
  clientName: string,
  bookingId: string,
  eventName?: string | null
): Promise<void> {
  const ref = eventName ? `«${eventName}»` : `#${bookingId.slice(0, 8)}`;
  await sendEmail({
    to,
    subject: `Новая заявка ${ref}`,
    html: layout(
      'Новая заявка',
      `<p>Поступила новая заявка ${ref} от <strong>${clientName}</strong>.</p>
       <p>Откройте админ-панель для обработки.</p>`
    ),
  });
}

export default {
  sendEmail,
  notifyClientSubmitted,
  notifyClientConfirmed,
  notifyClientCancelled,
  notifyManagerNewBooking,
};
