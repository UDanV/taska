import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { registerSchema } from "@/app/lib/validation/auth.schema";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: existingUser.password
            ? "Email is already in use"
            : "Этот email уже привязан к аккаунту через соцсеть",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Ошибка регистрации" },
      { status: 400 }
    );
  }
}