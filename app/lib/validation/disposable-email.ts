const DISPOSABLE_EMAIL_DOMAINS = new Set([
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

function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@").at(-1)?.replace(/\.+$/, "") ?? "";
}

export function isDisposableEmail(email: string) {
  const domain = getEmailDomain(email);

  return (
    DISPOSABLE_EMAIL_DOMAINS.has(domain) ||
    DISPOSABLE_DOMAIN_PARTS.some((part) => domain.includes(part))
  );
}
