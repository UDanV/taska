import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { registerSchema } from "@/app/lib/validation/auth.schema";
import { prisma } from "@/app/lib/prisma";
import { signIn } from "next-auth/react";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email уже используется" },
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

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка регистрации" }, { status: 400 });
    console.log(error);
  }
}
