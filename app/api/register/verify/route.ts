import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";
import { verifyRegistrationCodeSchema } from "@/app/lib/validation/auth.schema";

const MAX_REGISTRATION_CODE_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = verifyRegistrationCodeSchema.parse(body);
    const email = data.email.trim().toLowerCase();

    const pending = await prisma.pendingRegistration.findUnique({
      where: { email },
    });

    if (!pending) {
      return NextResponse.json({ error: "Код не найден или устарел" }, { status: 400 });
    }

    if (pending.expiresAt.getTime() < Date.now()) {
      await prisma.pendingRegistration.delete({ where: { id: pending.id } });
      return NextResponse.json({ error: "Код устарел. Зарегистрируйтесь заново" }, { status: 400 });
    }

    if (pending.attempts >= MAX_REGISTRATION_CODE_ATTEMPTS) {
      await prisma.pendingRegistration.delete({ where: { id: pending.id } });
      return NextResponse.json({ error: "Слишком много попыток. Зарегистрируйтесь заново" }, { status: 400 });
    }

    const isCodeValid = await bcrypt.compare(data.code, pending.codeHash);

    if (!isCodeValid) {
      await prisma.pendingRegistration.update({
        where: { id: pending.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: "Неверный код" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await prisma.pendingRegistration.delete({ where: { id: pending.id } });
      return NextResponse.json({ error: "Этот email уже зарегистрирован" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.create({
        data: {
          name: pending.name,
          email,
          emailVerified: new Date(),
          password: pending.passwordHash,
        },
      }),
      prisma.pendingRegistration.delete({
        where: { id: pending.id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка подтверждения кода" }, { status: 400 });
  }
}
