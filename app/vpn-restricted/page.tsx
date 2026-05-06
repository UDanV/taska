import Link from "next/link";
import { LogoIcon } from "@/app/shared/components/icons/common";

export default function VpnRestrictedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="flex w-full max-w-md flex-col items-center text-center">
        <LogoIcon size={72} />
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          403
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Доступ под VPN запрещен
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Сервис доступен только для пользователей из России без VPN или прокси.
          Отключите VPN и обновите страницу.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Обновить доступ
        </Link>
      </section>
    </main>
  );
}
