const TOKEN_VERSION = 1;
const COOKIE_MAX_AGE_SEC = 3600;

type Payload = {
  v: number;
  fr: boolean;
  exp: number;
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(s: string): Uint8Array {
  let base64 = s.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const len = hex.length / 2;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

export function getVpnProbeCookieMaxAgeSec(): number {
  const n = Number(process.env.VPN_REACH_COOKIE_MAX_AGE_SEC ?? COOKIE_MAX_AGE_SEC);
  return Number.isFinite(n) && n > 60 ? Math.floor(n) : COOKIE_MAX_AGE_SEC;
}

export async function signReachabilityPayload(secret: string, foreignReachable: boolean): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + getVpnProbeCookieMaxAgeSec();
  const payload: Payload = { v: TOKEN_VERSION, fr: foreignReachable, exp };
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(payloadJson));
  const sig = await hmacSha256Hex(secret, payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function verifyReachabilityToken(
  secret: string,
  token: string | undefined,
): Promise<{ foreignReachable: boolean } | null> {
  if (!token?.includes(".")) {
    return null;
  }
  const dot = token.lastIndexOf(".");
  const payloadB64 = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  if (!payloadB64 || !/^[0-9a-f]+$/i.test(sigHex)) {
    return null;
  }
  const expectedHex = await hmacSha256Hex(secret, payloadB64);
  try {
    const a = hexToBytes(expectedHex);
    const b = hexToBytes(sigHex);
    if (!timingSafeEqualBytes(a, b)) {
      return null;
    }
  } catch {
    return null;
  }

  let payload: Payload;
  try {
    const json = new TextDecoder().decode(base64UrlDecode(payloadB64));
    payload = JSON.parse(json) as Payload;
  } catch {
    return null;
  }

  if (payload.v !== TOKEN_VERSION || typeof payload.fr !== "boolean" || typeof payload.exp !== "number") {
    return null;
  }

  if (Math.floor(Date.now() / 1000) > payload.exp) {
    return null;
  }

  return { foreignReachable: payload.fr };
}
