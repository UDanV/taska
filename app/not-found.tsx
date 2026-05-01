import Link from "next/link";
import { LogoIcon } from "@/app/shared/components/icons/common";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="flex w-full max-w-md flex-col items-center text-center">
        <LogoIcon size={72} />
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Страница не найдена
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Такой страницы нет или она была перемещена.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            На главную
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            В дашборд
          </Link>
        </div>
      </section>
    </main>
  );
}
