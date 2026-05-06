import type { NextRequest } from "next/server";

const RUSSIA_COUNTRY_CODE = "RU";
const REQUEST_TIMEOUT_MS = 1500;

const IP_HEADERS = [
  "cf-connecting-ip",
  "true-client-ip",
  "x-real-ip",
  "x-forwarded-for",
] as const;

type IpApiResponse = {
  country_code?: string;
};

type ProxyCheckIpResult = {
  proxy?: string;
  type?: string;
};

type ProxyCheckResponse = {
  status?: string;
  [ip: string]: ProxyCheckIpResult | string | undefined;
};

export type VpnCheckResult = {
  blocked: boolean;
  checkedIp?: string;
  reason?: "non-russian-ip" | "vpn-or-proxy" | "missing-ip" | "private-ip";
};

export async function checkVpnForRequest(request: NextRequest): Promise<VpnCheckResult> {
  const rawIp = getClientIp(request);
  const ip = rawIp ? normalizeIp(rawIp) : undefined;

  if (!ip) {
    return { blocked: false, reason: "missing-ip" };
  }

  if (isPrivateOrLocalIp(ip)) {
    return { blocked: false, checkedIp: ip, reason: "private-ip" };
  }

  const [geoResult, proxyResult] = await Promise.allSettled([
    getIpCountryCode(ip),
    isVpnOrProxy(ip),
  ]);

  const countryCode =
    geoResult.status === "fulfilled" ? geoResult.value : undefined;

  if (countryCode && countryCode !== RUSSIA_COUNTRY_CODE) {
    return { blocked: true, checkedIp: ip, reason: "non-russian-ip" };
  }

  if (proxyResult.status === "fulfilled" && proxyResult.value) {
    return { blocked: true, checkedIp: ip, reason: "vpn-or-proxy" };
  }

  return { blocked: false, checkedIp: ip };
}

/** IPv4-mapped IPv6 (::ffff:x.x.x.x) → x.x.x.x for private-range checks and APIs. */
function normalizeIp(ip: string) {
  const lower = ip.toLowerCase();

  if (lower.startsWith("::ffff:")) {
    return lower.slice("::ffff:".length);
  }

  return ip;
}

function getClientIp(request: NextRequest) {
  for (const header of IP_HEADERS) {
    const value = request.headers.get(header);
    const ip = parseIpHeader(value);

    if (ip) {
      return ip;
    }
  }

  return undefined;
}

function parseIpHeader(value: string | null) {
  if (!value) {
    return undefined;
  }

  const firstValue = value.split(",")[0]?.trim();

  if (!firstValue || firstValue.toLowerCase() === "unknown") {
    return undefined;
  }

  return stripIpPort(firstValue);
}

function stripIpPort(value: string) {
  if (value.startsWith("[") && value.includes("]")) {
    return value.slice(1, value.indexOf("]"));
  }

  const portSeparatorIndex = value.lastIndexOf(":");

  if (portSeparatorIndex > -1 && value.indexOf(":") === portSeparatorIndex) {
    return value.slice(0, portSeparatorIndex);
  }

  return value;
}

function isPrivateOrLocalIp(ip: string) {
  const lower = ip.toLowerCase();

  if (lower === "::1" || lower === "localhost") {
    return true;
  }

  if (lower.startsWith("::ffff:")) {
    return isPrivateOrLocalIp(lower.slice("::ffff:".length));
  }

  if (lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80:")) {
    return true;
  }

  const parts = ip.split(".").map((part) => Number(part));

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}

async function getIpCountryCode(ip: string) {
  const response = await fetchWithTimeout(`https://ipapi.co/${ip}/json/`);

  if (!response.ok) {
    return undefined;
  }

  const data = (await response.json()) as IpApiResponse;

  return data.country_code?.toUpperCase();
}

async function isVpnOrProxy(ip: string) {
  const url = new URL(`https://proxycheck.io/v2/${ip}`);
  url.searchParams.set("vpn", "1");

  if (process.env.PROXYCHECK_API_KEY) {
    url.searchParams.set("key", process.env.PROXYCHECK_API_KEY);
  }

  const response = await fetchWithTimeout(url.toString());

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as ProxyCheckResponse;
  const result = data[ip];

  return typeof result === "object" && result?.proxy?.toLowerCase() === "yes";
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
