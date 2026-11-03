# PopSage v1 — shared-understanding handoff

Status: Product and architecture planning baseline confirmed · 3 November 2026

## Confirmation

The founder confirmed Q1–Q58 and the resulting PopSage planning baseline. The current project is a personal software engineering training project using fictional businesses, sample websites, and approved test documents. The initial recurring infrastructure target is US$0/month. Local implementation began with the Next.js scaffold on 3 November 2026. No real business pilot, paying customer, production-readiness claim, provider account creation, provisioning, deployment, live model invocation, production key generation, or paid activation is authorized.

## Settled shape

- Product: embeddable website support chat, team dashboard, visitor-safe uploaded knowledge, grounded AI answers, off-topic refusal, uncertainty handoff, and human takeover. Email ticketing, help center, tours, mobile apps, billing, business-system actions, and the later training exclusions remain outside scope.
- Isolation: one workspace is one support operation; application authorization plus Postgres RLS; private storage, jobs, retrieval, realtime rooms, and service roles preserve the same boundary.
- Training stack: Vercel Hobby; Neon Free Postgres/pgvector, managed auth, and private storage; Trigger.dev Free jobs; PartyServer/PartySocket on Cloudflare; Cloudflare Workers AI initially with independently configurable future OpenAI adapters.
- Reliability: Postgres is authoritative; transactional outbox, post-commit fast publication, retrying dispatcher, ordered idempotent streams, cursor recovery, poison-event quarantine, immutable accepted messages, and explicit conversation ownership.
- AI safety: classify before answer, retrieve only active workspace sources, require material-claim support, hand off on insufficient/conflicting evidence, invalidate late AI work, pin exact models, promote manually through common evaluations, and never use automatic paid fallback.
- Lifecycle: inactivity closure, abandonment versus resolution, transcript/session expiry, primary cleanup within 24 hours, documented provider backups, restricted troubleshooting, workspace/member/account deletion rules, and auditable sensitive actions.
- Security/access: invite-only verified email/password team access, recent authentication for destructive/sensitive actions, origin-scoped anonymous visitor sessions, Ed25519 access tokens with current-state checks, exact HTTPS origin matching, rate/input limits, and immediate revocation.

## Engineering validation remaining

These are implementation-design or evidence tasks, not unanswered product questions:

1. Verify every provider account’s recurring-free eligibility, quota behavior, regions, data destinations, backup/restore retention, and absence of automatic billing before creating resources.
2. Produce schemas, migrations, RLS policies/context mechanics, scoped service roles, outbox cursor/dispatcher/retry/quarantine design, transaction boundaries, and operational alert mechanics.
3. Specify Ed25519 key storage, claims, rotation overlap/emergency procedure, visitor-handle exchange details, and transactional email configuration.
4. Evaluate the selected Cloudflare model candidates against the versioned classification, retrieval, grounding, latency, quota, provider-switching, and critical-failure gates. Live OpenAI evaluation requires separate approval.
5. Validate document parsing/chunking, embedding profiles and migration, storage capacity, deletion/cleanup behavior, browser/iframe behavior, realtime recovery, tenant isolation, and free-tier failure modes.
6. Implement and validate the approved product in demonstrable slices, beginning with the local Next.js foundation and human-chat path; estimate broader delivery only after the first slice produces evidence.

## Scope-change rule

Engineering evidence may require revisiting a decision when a selected service cannot meet a hard requirement at US$0 or a security/correctness constraint conflicts with the design. Record such changes explicitly in the PRDs/ADRs. Routine schema, library, endpoint, UI-layout, retry-count, and code-organization choices do not reopen the product interview.
