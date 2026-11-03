# ADR 0013: Managed auth with invitation-gated membership

## Status

Accepted on 3 November 2026.

## Context

PopSage needs email/password, Google OAuth, magic-link authentication, verification, and password recovery without making identity creation equivalent to workspace access. The training product also needs operator-approved first workspaces, owner-issued teammate invitations, and database-enforced tenant isolation. Neon already provides Managed Better Auth and Postgres.

## Decision

- Use Neon Managed Better Auth for identity, provider accounts, verification, recovery, and sessions. Keep its `neon_auth` schema provider-owned.
- Use Drizzle ORM/Kit for the application schema and migrations, and `pg` transactions for invitation acceptance and transaction-local RLS context.
- Store workspaces, memberships, and invitations in application-owned tables. Authentication never implies membership.
- Represent invitation links as a public UUID selector plus a 256-bit random token. Persist only the SHA-256 token hash. Links are addressed, single-use, revocable, replaceable, and expire after 72 hours.
- Require a verified authenticated email matching the invitation before membership creation. Accept invitations transactionally and make replay by the same accepted identity idempotent.
- Keep owner onboarding an operator action and teammate invitation a workspace-owner action. Both produce copyable links; a custom invitation mailer and operator dashboard are deferred.
- Apply forced Postgres RLS to all application auth-domain tables. Runtime connections must use a role without `BYPASSRLS` or superuser privileges; the application fails closed otherwise.

## Consequences

Google, magic-link, and password identities share one authorization boundary. An identity with no membership reaches a no-access state. Provider configuration must require verification, enable the intended methods, and register exact trusted origins before live testing. Account linking must rely on provider-supported verified-email safeguards; PopSage does not merge accounts from an unverified email match.

Owner invitation issuance uses `npm run invite:owner -- owner@example.com` with the direct migration connection. Teammate links are created from the owner dashboard. Live migrations, provider configuration, and real email delivery remain separately authorized operational steps.
