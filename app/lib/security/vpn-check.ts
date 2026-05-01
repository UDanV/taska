import type { NextRequest } from "next/server";

type VpnCheckResult = {
  blocked: boolean;
  reason?: string;
};

type ProxyCheckResponse = {
  status?: string;
  message?: string;
  [ip: string]:
    | string
    | {
        proxy?: string;
        type?: string;
        risk?: number | string;
      }
    | undefined;
};

const PROXYCHECK_API_URL = "https://proxycheck.io/v2";
const DEFAULT_RISK_THRESHOLD = 66;
const BLOCKED_TYPES = new Set(["VPN", "TOR", "PROXY", "HOSTING"]);

export function getRequestIp(request: NextRequest): string | null {
  const headerIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("true-client-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null;

  if (!headerIp || isLocalIp(headerIp)) {
    return null;
  }

  return headerIp;
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

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { blocked: false };
    }

    const data = (await response.json()) as ProxyCheckResponse;
    const result = data[ip];

    if (!result || typeof result === "string") {
      return { blocked: false };
    }

    const type = result.type?.toUpperCase();
    const risk = Number(result.risk ?? 0);
    const riskThreshold = Number(process.env.VPN_CHECK_RISK_THRESHOLD ?? DEFAULT_RISK_THRESHOLD);

    if (result.proxy === "yes") {
      return { blocked: true, reason: type ?? "proxy" };
    }

    if (type && BLOCKED_TYPES.has(type)) {
      return { blocked: true, reason: type };
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
