import nodemailer from "nodemailer";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  secure: boolean;
};

function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const port = portRaw ? Number(portRaw) : 587;
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();
  const from = process.env.SMTP_FROM?.trim();

  return {
    host: host!,
    port,
    user: user!,
    password: password!,
    from: from!,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
  };
}

export async function sendRegistrationCodeEmail(email: string, code: string) {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  await transporter.sendMail({
    from: config.from,
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
}
