import type { Metadata } from "next";
import { LogoIcon } from "@/app/shared/components/icons/common";

export const metadata: Metadata = {
  title: "Доступ ограничен | Taska",
};

export default function VpnRestrictedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card/60 p-8 text-center shadow-sm">
        <div className="flex justify-center">
          <LogoIcon size={72} />
        </div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Доступ ограничен
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Отключите VPN или прокси
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          По требованиям безопасности доступ к сайту под VPN, прокси или Tor
          ограничен. Отключите VPN и обновите страницу.
        </p>
      </section>
    </main>
  );
}
