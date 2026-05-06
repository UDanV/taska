import type { NextRequest } from "next/server";
import type { ProxyCheckIpResult, ProxyCheckRoot } from "@/app/lib/security/proxycheck-types";

type VpnCheckResult = {
  blocked: boolean;
  reason?: string;
  checkedIp?: string;
};

const PROXYCHECK_API_URL = "https://proxycheck.io/v3";
const DEFAULT_RISK_THRESHOLD = 66;
const DEFAULT_ALLOWED_COUNTRIES = ["RU"];
const FALLBACK_IP_CACHE_TTL_MS = 60_000;

let fallbackPublicIpCache: { value: string | null; expiresAt: number } | null = null;

export function getRequestIp(request: NextRequest): string | null {
  const rawIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("true-client-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null;
  const headerIp = normalizeIp(rawIp);

  if (!headerIp || isLocalIp(headerIp)) {
    return null;
  }

  return headerIp;
}

export async function checkVpnForRequest(request: NextRequest): Promise<VpnCheckResult> {
  if (!isVpnCheckEnabled()) {
    return { blocked: false };
  }

  let ip = getRequestIp(request);
  if (!ip && isFallbackPublicIpEnabled()) {
    ip = await resolveFallbackPublicIp();
  }
  if (!ip) {
    return { blocked: false };
  }

  const result = await checkVpnAccess(ip);
  return { ...result, checkedIp: ip };
}

export async function checkVpnAccess(ip: string): Promise<VpnCheckResult> {
  if (!isVpnCheckEnabled()) {
    return { blocked: false };
  }

  const apiKey = process.env.VPN_CHECK_API_KEY;

  if (!apiKey) {
    return { blocked: false };
  }

  const provider = (process.env.VPN_CHECK_PROVIDER ?? "proxycheck").toLowerCase();

  if (provider !== "proxycheck") {
    return { blocked: false };
  }

  return checkProxyCheck(ip, apiKey);
}

function isVpnCheckEnabled() {
  return process.env.VPN_CHECK_ENABLED !== "false";
}

async function checkProxyCheck(ip: string, apiKey: string): Promise<VpnCheckResult> {
  try {
    const url = new URL(`${PROXYCHECK_API_URL}/${encodeURIComponent(ip)}`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("vpn", "1");
    url.searchParams.set("asn", "1");
    url.searchParams.set("risk", "1");
    url.searchParams.set("country", "1");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { blocked: false };
    }

    const data = (await response.json()) as ProxyCheckRoot;
    const result = data[ip];

    if (!result || typeof result !== "object") {
      return { blocked: false };
    }
    const ipResult = result as ProxyCheckIpResult;

    const risk = Number(ipResult.detections?.risk ?? 0);
    const riskThreshold = Number(process.env.VPN_CHECK_RISK_THRESHOLD ?? DEFAULT_RISK_THRESHOLD);
    const countryCode = ipResult.location?.country_code?.toUpperCase();

    if (process.env.VPN_CHECK_ONLY_RU === "true") {
      const allowedCountries = getAllowedCountries();
      if (!countryCode || !allowedCountries.has(countryCode)) {
        return { blocked: true, reason: `country:${countryCode ?? "unknown"}` };
      }
    }

    if (ipResult.detections?.proxy) {
      return { blocked: true, reason: "proxy" };
    }

    if (ipResult.detections?.vpn) {
      return { blocked: true, reason: "vpn" };
    }

    if (ipResult.detections?.tor) {
      return { blocked: true, reason: "tor" };
    }

    if (ipResult.detections?.hosting) {
      return { blocked: true, reason: "hosting" };
    }

    if (Number.isFinite(risk) && risk >= riskThreshold) {
      return { blocked: true, reason: `risk:${risk}` };
    }

    return { blocked: false };
  } catch {
    return { blocked: false };
  }
}

function isLocalIp(ip: string) {
  return (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

function normalizeIp(ip: string | null): string | null {
  if (!ip) return null;
  const clean = ip.trim().replace(/^\[|\]$/g, "");
  if (clean.startsWith("::ffff:")) {
    return clean.slice("::ffff:".length);
  }
  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(clean)) {
    return clean.split(":")[0] ?? clean;
  }
  return clean;
}

function getAllowedCountries(): Set<string> {
  const raw = process.env.VPN_CHECK_ALLOWED_COUNTRIES;
  if (!raw?.trim()) {
    return new Set(DEFAULT_ALLOWED_COUNTRIES);
  }
  const normalized = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  return new Set(normalized.length ? normalized : DEFAULT_ALLOWED_COUNTRIES);
}

function isFallbackPublicIpEnabled() {
  return process.env.VPN_CHECK_FALLBACK_PUBLIC_IP !== "false";
}

async function resolveFallbackPublicIp(): Promise<string | null> {
  const now = Date.now();
  if (fallbackPublicIpCache && fallbackPublicIpCache.expiresAt > now) {
    return fallbackPublicIpCache.value;
  }

  try {
    const response = await fetch("https://api64.ipify.org?format=json", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      fallbackPublicIpCache = { value: null, expiresAt: now + FALLBACK_IP_CACHE_TTL_MS };
      return null;
    }

    const data = (await response.json()) as { ip?: string };
    const normalized = normalizeIp(data.ip ?? null);
    if (!normalized || isLocalIp(normalized)) {
      fallbackPublicIpCache = { value: null, expiresAt: now + FALLBACK_IP_CACHE_TTL_MS };
      return null;
    }

    fallbackPublicIpCache = { value: normalized, expiresAt: now + FALLBACK_IP_CACHE_TTL_MS };
    return normalized;
  } catch {
    fallbackPublicIpCache = { value: null, expiresAt: now + FALLBACK_IP_CACHE_TTL_MS };
    return null;
  }
}
