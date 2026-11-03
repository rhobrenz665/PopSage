import "server-only";
import type { PoolClient } from "pg";
import { setDatabaseContext, withDatabaseTransaction } from "@/server/db/client";

export type WorkspaceRole = "owner" | "teammate";
export interface ActiveWorkspace { id: string; name: string; role: WorkspaceRole }

/** Owner role derives exclusively from workspaces.owner_user_id. */
export function listActiveWorkspaces(userId: string): Promise<ActiveWorkspace[]> {
  if (!userId) return Promise.resolve([]);
  return withDatabaseTransaction({ userId }, async (client) => {
    const result = await client.query<ActiveWorkspace>(`select w.id, w.name,
      case when w.owner_user_id = $1 then 'owner' else 'teammate' end as role
      from workspaces w join memberships m on m.workspace_id = w.id
      where m.user_id = $1 and m.status = 'active' order by w.created_at, w.id`, [userId]);
    return result.rows;
  });
}

export async function requireWorkspaceMembership(userId: string, workspaceId: string): Promise<ActiveWorkspace> {
  const workspaces = await listActiveWorkspaces(userId);
  const workspace = workspaces.find((entry) => entry.id === workspaceId);
  if (!workspace) throw new Error("workspace_access_denied");
  return workspace;
}

/** Rechecks and locks ownership inside the mutating transaction; no client-provided role. */
export async function requireWorkspaceOwner(client: PoolClient, userId: string, workspaceId: string) {
  // Set the requested scope before the locking read. RLS still verifies the row's
  // owner_user_id; this flag alone never proves ownership.
  await setDatabaseContext(client, { userId, workspaceId, isOwner: true });
  const result = await client.query<{ owner_user_id: string }>(`select owner_user_id from workspaces where id = $1 for update`, [workspaceId]);
  if (!userId || result.rows[0]?.owner_user_id !== userId) throw new Error("owner_required");
  const membership = await client.query(`select 1 from memberships where workspace_id = $1 and user_id = $2 and status = 'active'`, [workspaceId, userId]);
  if (!membership.rowCount) throw new Error("owner_required");
}
