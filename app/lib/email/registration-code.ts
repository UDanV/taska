import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Resend is not configured");
  }

  return new Resend(apiKey);
}

export async function sendRegistrationCodeEmail(email: string, code: string) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_FROM?.trim();

  if (!from) {
    throw new Error("Sender email is not configured");
  }

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Код подтверждения Taska",
    text: `Ваш код подтверждения Taska: ${code}. Код действует 10 минут.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h1 style="font-size: 20px;">Код подтверждения Taska</h1>
        <p>Введите этот код, чтобы завершить регистрацию:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${code}</p>
        <p>Код действует 10 минут. Если вы не регистрировались в Taska, просто игнорируйте это письмо.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}