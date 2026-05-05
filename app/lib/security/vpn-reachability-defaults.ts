export const DEFAULT_REACH_PROBE_URLS = [
  "https://telegram.org/favicon.ico",
  "https://www.instagram.com/favicon.ico",
  "https://www.facebook.com/favicon.ico",
] as const;

export function parseReachProbeUrls(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [...DEFAULT_REACH_PROBE_URLS];
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
