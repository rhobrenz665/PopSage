import "server-only";
import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { setDatabaseContext, withDatabaseTransaction } from "@/server/db/client";
import { requireWorkspaceOwner, type WorkspaceRole } from "@/server/workspaces/service";
import { canonicalizeEmail, generateInvitationToken, hashInvitationToken, invitationTokenMatches, INVITATION_TTL_MS, SELECTOR_PATTERN, TOKEN_PATTERN, type InvitationCredentials } from "./tokens";

export interface InvitationIdentity { id: string; email: string; emailVerified: boolean; name?: string | null }
export type InvitationErrorCode = "malformed" | "invalid" | "expired" | "revoked" | "replaced" | "consumed" | "wrong_email" | "unverified" | "workspace_name_required";
export class InvitationError extends Error {
  constructor(public readonly code: InvitationErrorCode) { super(code); this.name = "InvitationError"; }
}
interface InvitationRow {
  selector: string; kind: "owner_onboarding" | "teammate"; email: string; token_hash: string;
  workspace_id: string | null; status: "pending" | "accepted" | "revoked" | "replaced";
  expires_at: Date; accepted_by_user_id: string | null; accepted_workspace_id: string | null;
}
function validateCredentials(credentials: InvitationCredentials) {
  if (!SELECTOR_PATTERN.test(credentials.selector) || !TOKEN_PATTERN.test(credentials.token)) throw new InvitationError("malformed");
}
function checkPending(row: InvitationRow, now: Date) {
  if (row.status === "revoked" || row.status === "replaced") throw new InvitationError(row.status);
  if (row.status === "accepted") throw new InvitationError("consumed");
  if (row.expires_at <= now) throw new InvitationError("expired");
}
async function readInvitation(client: PoolClient, credentials: InvitationCredentials, lock = false): Promise<InvitationRow> {
  const result = await client.query<InvitationRow>(`select selector, kind, email, token_hash, workspace_id, status, expires_at,
    accepted_by_user_id, accepted_workspace_id from invitations where selector = $1 ${lock ? "for update" : ""}`, [credentials.selector]);
  const row = result.rows[0];
  if (!row || !invitationTokenMatches(credentials.token, row.token_hash)) throw new InvitationError("invalid");
  return row;
}
function credentialContext(credentials: InvitationCredentials) {
  validateCredentials(credentials);
  return { invitationSelector: credentials.selector, invitationHash: hashInvitationToken(credentials.token) };
}

/** Safe pre-authentication metadata; intentionally omits the invited email. */
export async function previewInvitation(credentials: InvitationCredentials) {
  return withDatabaseTransaction(credentialContext(credentials), async (client) => {
    const row = await readInvitation(client, credentials);
    checkPending(row, new Date());
    return { kind: row.kind, expiresAt: row.expires_at };
  });
}

/** Create teammate invitations only. Owner onboarding is issued by a separate operator capability. */
export async function createInvitation(input: { userId: string; workspaceId: string; email: string }) {
  const email = canonicalizeEmail(input.email);
  const generated = generateInvitationToken();
  return withDatabaseTransaction({ userId: input.userId }, async (client) => {
    await requireWorkspaceOwner(client, input.userId, input.workspaceId);
    const now = new Date();
    const existing = await client.query<{ selector: string }>(`select selector from invitations
      where workspace_id = $1 and email = $2 and kind = 'teammate' and status = 'pending'
      for update`, [input.workspaceId, email]);
    if (existing.rows[0]) {
      await client.query(`update invitations set status = 'replaced', replaced_by_selector = $2
        where selector = $1`, [existing.rows[0].selector, generated.selector]);
    }
    await client.query(`insert into invitations (selector, kind, email, token_hash, workspace_id, invited_by_user_id, created_at, expires_at)
      values ($1, 'teammate', $2, $3, $4, $5, $6, $7)`, [generated.selector, email, generated.tokenHash, input.workspaceId, input.userId, now, new Date(now.getTime() + INVITATION_TTL_MS)]);
    return { selector: generated.selector, token: generated.token };
  });
}

/** Revoke the old link and insert its successor atomically; old tokens never become valid again. */
export async function replaceInvitation(input: { userId: string; workspaceId: string; selector: string }) {
  if (!SELECTOR_PATTERN.test(input.selector)) throw new InvitationError("malformed");
  return withDatabaseTransaction({ userId: input.userId }, async (client) => {
    await requireWorkspaceOwner(client, input.userId, input.workspaceId);
    const result = await client.query<InvitationRow>(`select selector, kind, email, token_hash, workspace_id, status, expires_at,
      accepted_by_user_id, accepted_workspace_id from invitations where selector = $1 and workspace_id = $2 for update`, [input.selector, input.workspaceId]);
    const row = result.rows[0];
    if (!row) throw new InvitationError("invalid");
    // An expired pending invitation may be replaced, but accepted/revoked/replaced links may not.
    if (row.status !== "pending") throw new InvitationError(row.status === "accepted" ? "consumed" : row.status);
    const generated = generateInvitationToken();
    await client.query(`update invitations set status = 'replaced', replaced_by_selector = $2 where selector = $1`, [row.selector, generated.selector]);
    const now = new Date();
    await client.query(`insert into invitations (selector, kind, email, token_hash, workspace_id, invited_by_user_id, created_at, expires_at)
      values ($1, 'teammate', $2, $3, $4, $5, $6, $7)`, [generated.selector, row.email, generated.tokenHash, input.workspaceId, input.userId, now, new Date(now.getTime() + INVITATION_TTL_MS)]);
    return { selector: generated.selector, token: generated.token };
  });
}

export async function revokeInvitation(input: { userId: string; workspaceId: string; selector: string }) {
  if (!SELECTOR_PATTERN.test(input.selector)) throw new InvitationError("malformed");
  return withDatabaseTransaction({ userId: input.userId }, async (client) => {
    await requireWorkspaceOwner(client, input.userId, input.workspaceId);
    const result = await client.query(`update invitations set status = 'revoked' where selector = $1 and workspace_id = $2 and status = 'pending' returning selector`, [input.selector, input.workspaceId]);
    return { revoked: Boolean(result.rowCount) };
  });
}

export interface InvitationAcceptance { status: "accepted" | "replayed"; workspaceId: string; role: WorkspaceRole }
export async function acceptInvitation(input: InvitationCredentials & { identity: InvitationIdentity; workspaceName?: string }): Promise<InvitationAcceptance> {
  const context = credentialContext(input);
  const identity = input.identity;
  if (!identity.id || !identity.emailVerified) throw new InvitationError("unverified");
  const email = canonicalizeEmail(identity.email);
  return withDatabaseTransaction({ ...context, userId: identity.id, email }, async (client) => {
    const preview = await readInvitation(client, input);
    if (preview.email !== email) throw new InvitationError("wrong_email");
    if (preview.status === "accepted") {
      if (preview.accepted_by_user_id !== identity.id || !preview.accepted_workspace_id) throw new InvitationError("consumed");
      const active = await client.query(`select 1 from memberships where workspace_id = $1 and user_id = $2 and status = 'active'`, [preview.accepted_workspace_id, identity.id]);
      if (!active.rowCount) throw new InvitationError("consumed");
      return { status: "replayed", workspaceId: preview.accepted_workspace_id, role: preview.kind === "owner_onboarding" ? "owner" : "teammate" };
    }
    // Locks serialize concurrent acceptance of the same link.
    const row = await readInvitation(client, input, true);
    if (row.email !== email) throw new InvitationError("wrong_email");
    if (row.status === "accepted") {
      if (row.accepted_by_user_id !== identity.id || !row.accepted_workspace_id) throw new InvitationError("consumed");
      const active = await client.query(`select 1 from memberships where workspace_id = $1 and user_id = $2 and status = 'active'`, [row.accepted_workspace_id, identity.id]);
      if (!active.rowCount) throw new InvitationError("consumed");
      return { status: "replayed", workspaceId: row.accepted_workspace_id, role: row.kind === "owner_onboarding" ? "owner" : "teammate" };
    }
    checkPending(row, new Date());
    let workspaceId = row.workspace_id;
    if (row.kind === "owner_onboarding") {
      const name = input.workspaceName?.trim();
      if (!name || name.length > 100) throw new InvitationError("workspace_name_required");
      workspaceId = randomUUID();
      await setDatabaseContext(client, { ...context, userId: identity.id, email, workspaceId });
      await client.query(`insert into workspaces (id, name, owner_user_id) values ($1, $2, $3)`, [workspaceId, name, identity.id]);
    }
    if (!workspaceId) throw new InvitationError("invalid");
    await setDatabaseContext(client, { ...context, userId: identity.id, email, workspaceId });
    await client.query(`insert into memberships (workspace_id, user_id) values ($1, $2)
      on conflict (workspace_id, user_id) do update set status = 'active', updated_at = now()`, [workspaceId, identity.id]);
    await client.query(`update invitations set status = 'accepted', accepted_at = now(), accepted_by_user_id = $2,
      accepted_workspace_id = $3 where selector = $1`, [row.selector, identity.id, workspaceId]);
    return { status: "accepted", workspaceId, role: row.kind === "owner_onboarding" ? "owner" : "teammate" };
  });
}
