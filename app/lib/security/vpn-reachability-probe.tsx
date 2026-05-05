"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type ProbeConfig = {
  enabled: boolean;
  needsProbe: boolean;
  urls: string[];
  minHits: number;
  timeoutMs: number;
};

function probeImage(url: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const done = (ok: boolean) => {
      clearTimeout(timer);
      img.src = "";
      resolve(ok);
    };
    const timer = window.setTimeout(() => done(false), timeoutMs);
    img.onload = () => done(true);
    img.onerror = () => done(false);
    const sep = url.includes("?") ? "&" : "?";
    img.src = `${url}${sep}_vpnreach=${Date.now()}`;
  });
}

export function VpnReachabilityProbe() {
  const pathname = usePathname();
  const genRef = useRef(0);

  useEffect(() => {
    if (pathname?.startsWith("/vpn-restricted")) {
      return;
    }

    const myGen = ++genRef.current;
    let cancelled = false;

    (async () => {
      let cfg: ProbeConfig;
      try {
        const res = await fetch("/api/security/vpn-reachability", { cache: "no-store" });
        cfg = (await res.json()) as ProbeConfig;
      } catch {
        return;
      }

      if (cancelled || myGen !== genRef.current || !cfg.enabled || !cfg.needsProbe || !cfg.urls?.length) {
        return;
      }

      const timeoutMs = cfg.timeoutMs ?? 4000;
      const results = await Promise.all(cfg.urls.map((u) => probeImage(u, timeoutMs)));
      const successes = results.filter(Boolean).length;

      if (cancelled || myGen !== genRef.current) {
        return;
      }

      try {
        await fetch("/api/security/vpn-reachability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ successes, total: cfg.urls.length }),
        });
      } catch {
        return;
      }

      if (!cancelled && myGen === genRef.current) {
        window.location.reload();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
