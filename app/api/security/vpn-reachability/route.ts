import { type NextRequest, NextResponse } from "next/server";
import { VPN_REACH_COOKIE_NAME } from "@/app/lib/security/vpn-check";
import { parseReachProbeUrls } from "@/app/lib/security/vpn-reachability-defaults";
import {
  getVpnProbeCookieMaxAgeSec,
  signReachabilityPayload,
  verifyReachabilityToken,
} from "@/app/lib/security/vpn-probe-token";

function isVpnCheckEnabled() {
  return process.env.VPN_CHECK_ENABLED !== "false";
}

function isReachabilityConfigured() {
  return (
    isVpnCheckEnabled() &&
    process.env.VPN_CHECK_REACHABILITY === "true" &&
    !!process.env.VPN_PROBE_SECRET?.trim()
  );
}

function getMinHits(urlCount: number) {
  const raw = Number(process.env.VPN_REACH_MIN_HITS ?? 1);
  if (!Number.isFinite(raw)) {
    return 1;
  }
  return Math.max(1, Math.min(urlCount, Math.floor(raw)));
}

export async function GET(request: NextRequest) {
  const enabled = isReachabilityConfigured();
  const urls = parseReachProbeUrls(process.env.VPN_REACH_PROBE_URLS);
  const minHits = getMinHits(urls.length);
  const timeoutMs = Math.min(
    15_000,
    Math.max(1500, Number(process.env.VPN_REACH_PROBE_TIMEOUT_MS ?? 4000) || 4000),
  );

  const secret = process.env.VPN_PROBE_SECRET ?? "";
  const raw = request.cookies.get(VPN_REACH_COOKIE_NAME)?.value;
  const verified = enabled && secret ? await verifyReachabilityToken(secret, raw) : null;
  const needsProbe = enabled && !verified;

  return NextResponse.json({
    enabled,
    needsProbe,
    urls,
    minHits,
    timeoutMs,
  });
}

export async function POST(request: NextRequest) {
  if (!isReachabilityConfigured()) {
    return NextResponse.json({ error: "reachability disabled" }, { status: 503 });
  }

  const secret = process.env.VPN_PROBE_SECRET!;
  const urls = parseReachProbeUrls(process.env.VPN_REACH_PROBE_URLS);
  const minHits = getMinHits(urls.length);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const successes = Number((body as { successes?: unknown }).successes);
  const total = Number((body as { total?: unknown }).total);

  if (!Number.isFinite(successes) || !Number.isFinite(total)) {
    return NextResponse.json({ error: "invalid counters" }, { status: 400 });
  }

  if (total !== urls.length) {
    return NextResponse.json({ error: "total mismatch" }, { status: 400 });
  }

  const clampedSuccess = Math.max(0, Math.min(Math.floor(successes), urls.length));
  const foreignReachable = clampedSuccess >= minHits;

  const token = await signReachabilityPayload(secret, foreignReachable);
  const res = NextResponse.json({ ok: true, foreignReachable });
  res.cookies.set(VPN_REACH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getVpnProbeCookieMaxAgeSec(),
  });
  return res;
}
