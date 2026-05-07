import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { randomInt } from "node:crypto";
import { sendRegistrationCodeEmail } from "@/app/lib/email/registration-code";
import { registerSchema } from "@/app/lib/validation/auth.schema";
import { prisma } from "@/app/lib/prisma";

const REGISTRATION_CODE_TTL_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    const email = data.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: existingUser.password
            ? "Этот email уже зарегистрирован"
            : "Этот email уже привязан к аккаунту через соцсеть",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const code = randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + REGISTRATION_CODE_TTL_MS);

    await prisma.pendingRegistration.upsert({
      where: { email },
      update: {
        name: data.name,
        passwordHash: hashedPassword,
        codeHash,
        attempts: 0,
        expiresAt,
      },
      create: {
        name: data.name,
        email,
        passwordHash: hashedPassword,
        codeHash,
        expiresAt,
      },
    });

    await sendRegistrationCodeEmail(email, code);

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error("register_failed", error);
    if (
      error instanceof Error &&
      (error.message.startsWith("Resend is not configured") ||
        error.message.startsWith("Sender email is not configured"))
    ) {
      const isProd = process.env.NODE_ENV === "production";
      return NextResponse.json(
        {
          error: isProd
            ? "Не настроена отправка почты (Resend). Обратитесь к администратору"
            : error.message,
        },
        { status: 500 },
      );
    }
    if (error instanceof Error && process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { error: `Ошибка регистрации: ${error.message}` },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Ошибка регистрации" },
      { status: 400 }
    );
  }
}