# Enforce workspace isolation in application policy and Postgres RLS

Accepted on 3 November 2026 (Q40). Every workspace-owned database record is protected by both application authorization and Postgres row-level security. Authentication alone grants no data access. Set trusted user/workspace context within each transaction, fail closed when context is absent or invalid, and never derive trusted scope solely from a client-supplied identifier.

Background processing uses narrowly scoped service roles and explicit workspace/job context rather than a general RLS bypass. Migrations and emergency administration are separate audited capabilities, not application runtime credentials. Object storage, PartyServer rooms, AI retrieval, outbox dispatch, and job payloads must preserve the same tenant boundary even though Postgres RLS cannot protect those systems directly.

Tests must attempt cross-workspace reads, writes, vector retrieval, subscriptions, job execution, and source access through both application endpoints and database policies. This defense adds policy complexity and transaction-context discipline, accepted to reduce the effect of a missed application filter.

This ADR records planning only and does not authorize implementation or database creation.
