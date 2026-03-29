import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Manrope } from "next/font/google";
import "./globals.css";
import { authOptions } from "./lib/auth/options";
import { Providers } from "./providers/toast";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Taska - минималистичный таск-менеджер для личного пользования и команд, которые ценят скорость и простоту.",
  description: "Попробуйте сейчас. Бесплатно. Без ограничений. Навсегда.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} antialiased`}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}