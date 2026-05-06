const STATIC_DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "20minutemail.com",
  "33mail.com",
  "anonaddy.com",
  "deltajohnsons.com",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "maildrop.cc",
  "mailinator.com",
  "moakt.com",
  "sharklasers.com",
  "tempmail.com",
  "tempmailo.com",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
]);

const DISPOSABLE_DOMAIN_PARTS = [
  "deltajohnsons",
  "guerrillamail",
  "mailinator",
  "tempmail",
  "trashmail",
];

const REMOTE_DISPOSABLE_DOMAINS_URL =
  "https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt";

const REMOTE_FETCH_TTL_MS = 24 * 60 * 60 * 1000;

let remoteDisposableDomains: Set<string> | null = null;
let lastRemoteFetchAt: number | null = null;
let remoteFetchInFlight: Promise<void> | null = null;

async function fetchRemoteDisposableDomains() {
  if (typeof fetch === "undefined") return;

  if (lastRemoteFetchAt && Date.now() - lastRemoteFetchAt < REMOTE_FETCH_TTL_MS) {
    return;
  }

  if (remoteFetchInFlight) {
    return remoteFetchInFlight;
  }

  remoteFetchInFlight = (async () => {
    try {
      const response = await fetch(REMOTE_DISPOSABLE_DOMAINS_URL, {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const text = await response.text();
      const domains = text
        .split(/\r?\n/)
        .map((line) => line.trim().toLowerCase())
        .filter((line) => line && !line.startsWith("#"));

      if (domains.length > 0) {
        remoteDisposableDomains = new Set(domains);
        lastRemoteFetchAt = Date.now();
      }
    } catch {

    } finally {
      remoteFetchInFlight = null;
    }
  })();

  return remoteFetchInFlight;
}

void fetchRemoteDisposableDomains();

function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@").at(-1)?.replace(/\.+$/, "") ?? "";
}

export function isDisposableEmail(email: string) {
  const domain = getEmailDomain(email);

  return (
    (remoteDisposableDomains ?? STATIC_DISPOSABLE_EMAIL_DOMAINS).has(domain) ||
    DISPOSABLE_DOMAIN_PARTS.some((part) => domain.includes(part))
  );
}
