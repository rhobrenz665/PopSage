import { Pool } from "pg"

import {
  canonicalizeEmail,
  generateInvitationToken,
  INVITATION_TTL_MS,
  serializeInvitationCredentials,
} from "../src/server/invitations/tokens"

const emailArgument = process.argv[2]
const databaseUrl = process.env.DATABASE_URL_UNPOOLED
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

if (!emailArgument) {
  throw new Error("Usage: npm run invite:owner -- owner@example.com")
}
if (!databaseUrl) {
  throw new Error("DATABASE_URL_UNPOOLED is required for operator actions.")
}

const email = canonicalizeEmail(emailArgument)
const invitation = generateInvitationToken()
const now = new Date()
const pool = new Pool({ connectionString: databaseUrl, max: 1 })

try {
  const client = await pool.connect()
  try {
    await client.query("begin")
    await client.query("select set_config('app.operator', 'true', true)")
    const existing = await client.query<{ selector: string }>(
      `select selector from invitations
       where kind = 'owner_onboarding' and email = $1 and status = 'pending'
       for update`,
      [email],
    )
    if (existing.rows[0]) {
      await client.query(
        `update invitations set status = 'replaced', replaced_by_selector = $2
         where selector = $1`,
        [existing.rows[0].selector, invitation.selector],
      )
    }
    await client.query(
    `insert into invitations
      (selector, kind, email, token_hash, created_at, expires_at)
     values ($1, 'owner_onboarding', $2, $3, $4, $5)`,
    [
      invitation.selector,
      email,
      invitation.tokenHash,
      now,
      new Date(now.getTime() + INVITATION_TTL_MS),
    ],
    )
    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }

  const credential = serializeInvitationCredentials(invitation)
  console.log(new URL(`/invite/${credential}`, appUrl).toString())
} finally {
  await pool.end()
}
