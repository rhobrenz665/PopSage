import "server-only";
import { Pool, type PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema";

let pool: Pool | undefined;
export function getPool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("database_not_configured");
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
    attachDatabasePool(pool);
  }
  return pool;
}

export function getDatabase() {
  return drizzle(getPool(), { schema });
}

export interface DatabaseContext {
  userId?: string;
  workspaceId?: string;
  invitationHash?: string;
  invitationSelector?: string;
  email?: string;
  isOwner?: boolean;
}

/** Always transaction-local: safe with PgBouncer and pooled connections. Context is server trusted. */
export async function setDatabaseContext(client: PoolClient, context: DatabaseContext) {
  await client.query(`select
    set_config('app.user_id', $1, true),
    set_config('app.workspace_id', $2, true),
    set_config('app.invitation_hash', $3, true),
    set_config('app.invitation_selector', $4, true),
    set_config('app.email', $5, true),
    set_config('app.is_owner', $6, true)`, [
    context.userId ?? "", context.workspaceId ?? "", context.invitationHash ?? "",
    context.invitationSelector ?? "", context.email ?? "", context.isOwner ? "true" : "false",
  ]);
}

export async function withDatabaseTransaction<T>(context: DatabaseContext, run: (client: PoolClient) => Promise<T>, connectionPool = getPool()): Promise<T> {
  const client = await connectionPool.connect();
  try {
    await client.query("begin");
    // Fail closed if a migration/admin credential was accidentally configured at runtime.
    const role = await client.query<{ unsafe: boolean }>(`select rolsuper or rolbypassrls as unsafe from pg_roles where rolname = current_user`);
    if (role.rows[0]?.unsafe !== false) throw new Error("unsafe_database_runtime_role");
    await setDatabaseContext(client, context);
    const result = await run(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
