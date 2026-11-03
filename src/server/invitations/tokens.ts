import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

export const INVITATION_TTL_MS = 72 * 60 * 60 * 1000;
export const SELECTOR_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
export const INVITATION_CREDENTIAL_PATTERN = new RegExp(
  `^(${SELECTOR_PATTERN.source.slice(1, -1)})\\.(${TOKEN_PATTERN.source.slice(1, -1)})$`,
  "i",
);

export interface InvitationCredentials {
  selector: string;
  token: string;
}

export function canonicalizeEmail(email: string): string {
  const canonical = email.trim().toLowerCase();
  if (canonical.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(canonical)) {
    throw new Error("invalid_email");
  }
  return canonical;
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function invitationTokenMatches(token: string, hash: string): boolean {
  if (!TOKEN_PATTERN.test(token) || !/^[a-f0-9]{64}$/.test(hash)) return false;
  return timingSafeEqual(Buffer.from(hashInvitationToken(token), "hex"), Buffer.from(hash, "hex"));
}

/** The raw token is returned once for link delivery and must never be persisted or logged. */
export function generateInvitationToken() {
  const token = randomBytes(32).toString("base64url");
  return { selector: randomUUID(), token, tokenHash: hashInvitationToken(token) };
}

export function serializeInvitationCredentials(
  credentials: InvitationCredentials,
): string {
  return `${credentials.selector}.${credentials.token}`;
}

export function parseInvitationCredentials(value: string): InvitationCredentials {
  const match = INVITATION_CREDENTIAL_PATTERN.exec(value);
  if (!match) throw new Error("malformed_invitation");
  return { selector: match[1], token: match[2] };
}
