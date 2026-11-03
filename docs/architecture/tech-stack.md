# PopSage: technology stack (v1)

> **For coding agents:** this is the source of truth for _how_ PopSage is built. The [PRD map](../prds/README.md) defines _what_ it does, the [glossary](../../GLOSSARY.md) defines shared vocabulary, and the [ADRs](../adr/) explain consequential decisions. Read the relevant documents before implementation. Versions and provider behavior change quickly; consult installed and primary documentation rather than relying on memory.

| | |
|---|---|
| Status | Active implementation baseline (3 November 2026) |
| Current implementation permission | Local Next.js scaffold and incremental product implementation |
| Not authorized | Cloud provisioning, paid plans/APIs, billing, real business/customer data |
| Companion docs | [PRDs](../prds/README.md), [glossary](../../GLOSSARY.md), [diagrams](./diagrams.md), [infrastructure research](../research/infrastructure-options.md) |

---

## 1. Overview

| Layer | PopSage v1 choice |
|---|---|
| App framework | Next.js 16.4.4, App Router, `src/` directory, Server Components by default |
| Language | TypeScript 5, strict mode |
| UI | Tailwind CSS 4 plus shadcn/ui Base/Nova primitives; Turbopack in development and PostCSS/Webpack in verified production builds |
| Validation | Zod at untrusted boundaries; form library remains an implementation choice |
| HTTP API | Next.js Route Handlers and application services; no client-to-database access |
| Database | Neon Postgres with pgvector; Postgres is authoritative |
| Database access | Server-side SQL transactions; application authorization plus Postgres RLS; exact typed query/migration library pending a focused decision |
| Authentication | Neon Managed Better Auth for owners and teammates; PopSage membership authorization remains separate |
| Visitor sessions | Rotating first-party opaque handle plus 15-minute Ed25519-signed iframe credentials |
| Realtime | Cloudflare PartyServer + PartySocket; Postgres-backed cursor recovery |
| AI | Provider-independent classification, generation, and embedding interfaces; Cloudflare Workers AI active initially; OpenAI adapter inactive until approved |
| Background work | Trigger.dev Free for ingestion, cleanup, and embedding migrations |
| File storage | Private Neon Object Storage with scoped presigned operations |
| Hosting target | Vercel Hobby for Next.js, Cloudflare Free for realtime/AI, Neon Free for data/auth/storage, Trigger.dev Free for jobs |
| Package manager | npm initially; no workspace or build orchestrator until multiple local packages justify it |
| Quality | ESLint, TypeScript checks, automated unit/integration tests, browser tests, and provider-independent AI evaluations |

**Explicitly not used in the current plan:** Neon Data API, Neon AI Gateway, Neon Functions, hosted PartyKit, client-side database access, automatic paid-provider fallback, LangChain, a separate vector database, a cache service, or a universal AI-provider plugin system.

## 2. Repository layout

Start as one Next.js application. Introduce another package or deployable directory only when the realtime Worker or another independently deployed boundary is implemented.

```text
/
├── src/
│   ├── app/                 # App Router pages, layouts, and HTTP route handlers
│   ├── components/          # Shared presentational components when introduced
│   ├── features/            # Product slices: chat, inbox, knowledge, AI, handoff
│   ├── server/              # Authorization, domain services, persistence, outbox
│   ├── providers/           # Narrow auth/storage/realtime/AI/job adapters
│   └── shared/              # Provider-neutral schemas, event types, constants
├── public/                  # Static assets and, later, the generated embed loader
├── services/
│   └── realtime/            # PartyServer Worker when the realtime slice begins
├── docs/                    # PRDs, ADRs, architecture, and research
├── GLOSSARY.md
└── package.json
```

Directories beyond `src/app` are created with their first real module, not as empty architecture. The website embed loader will be a small first-party script with a minimal build, but its bundler is not selected yet.

## 3. Frontend

- Use Next.js App Router and the `src/` directory. Server Components are the default; add Client Components only for browser state, forms, realtime connections, and other interactions.
- Tailwind CSS 4 and shadcn/ui Base/Nova are installed. Extend the checked-in shadcn primitives and semantic tokens rather than creating parallel buttons, cards, dialogs, badges, or form controls.
- Poppins is the product display/body face; Source Serif 4 is reserved for short italic emphasis. Both are self-hosted from pinned npm packages rather than fetched from Google at build time.
- The dashboard and iframe widget share design tokens and accessible primitives while remaining separate route surfaces with different authorization contexts.
- The widget is loaded in an iframe. The host-page loader owns first-party continuity and communicates with the iframe through a constrained, origin-checked channel.
- Render visitor, teammate, model, and document-derived content as untrusted. Markdown rendering must sanitize output and never enable raw executable HTML.
- Support the PRD browser matrix and meet keyboard, screen-reader, focus, narrow-screen, and reduced-motion basics from the first functional slice.

## 4. API and application layer

- Use Next.js Route Handlers for public HTTP entry points. Keep domain policy in server-only application services rather than route files.
- Validate every untrusted input and provider response. Zod is the planned schema boundary; install and pin it when the first request contract is implemented.
- Protected team requests require a valid auth session **and** active workspace membership with the required role.
- Widget requests require a current visitor session scoped to the workspace and exact allowed origin. A public installation ID is never an authorization credential.
- Client-provided workspace, role, sender, ownership, or source identifiers never establish trusted scope.
- Commands must be idempotent where retries are expected. Stable IDs and ordered cursors are part of request/event contracts.
- Do not use Server Actions for security-sensitive chat or provider orchestration in v1. A future decision may allow them for narrow dashboard forms, but they must call the same application services and authorization rules.

The exact typed API client library is deliberately not selected. Begin with framework-native HTTP boundaries; add RPC/OpenAPI only when a demonstrated contract-sharing need outweighs its dependency and migration cost.

## 5. Data: Neon Postgres and pgvector

- Neon Postgres is the durable source of truth for workspaces, memberships, visitor sessions, conversations, messages, documents, chunks, job outcomes, AI decisions, and outbox events.
- Use direct server-side Postgres connections and transactions. The Neon Data API is not part of the current plan.
- Every workspace-owned row has an enforceable workspace relationship. Apply application authorization and Postgres RLS with trusted transaction-local context that fails closed when absent.
- Background work uses narrowly scoped roles and explicit workspace/job context. Application runtime credentials do not receive a general RLS bypass.
- Vector retrieval filters eligible workspace/source versions before ranking. Equal vector dimensions do not imply embedding compatibility.
- Accepted message content is immutable. Corrections are new ordered messages.
- Schema migrations run against a local/test or isolated development target before any future production target.

### Data-access library decision gate

Do not select an ORM only because the tutorial used Prisma. Before the database slice, compare a thin SQL-first option and a typed ORM against transaction-local RLS context, pgvector queries/indexes, serverless Neon connections, explicit migrations, and test isolation. Record the choice in an ADR and update this document.

## 6. Authentication and visitor access

### Owners and teammates

- Neon Managed Better Auth provides verified email/password identity and session verification.
- No public signup, OAuth/social login, or automatic workspace creation in v1.
- Authentication alone grants no workspace access. Membership is created through an addressed, single-use, revocable invitation that expires after 72 hours.
- Neon development email is for fictional training identities only. Review custom SMTP before real users.

### Visitors

- The host-page loader stores a cryptographically random opaque handle in the embedding site's first-party storage; only its hash is stored server-side.
- Rotate the handle after successful exchange and reject replaced-handle replay. It expires after 90 inactive days.
- Issue 15-minute iframe credentials signed with Ed25519. Include a key ID and support controlled public-key overlap during rotation.
- Scope credentials to the visitor session, workspace, and exact normalized origin. Require HTTPS except HTTP localhost during development; no origin wildcards.
- Every API request and realtime connection rechecks current session, workspace, and origin state. Removing an origin revokes affected credentials and connections immediately.

## 7. Realtime: PartyServer and PartySocket

- Use `partyserver` on Cloudflare Workers + Durable Objects and `partysocket` in the dashboard and widget. Hosted PartyKit and its retired deployment path are not used.
- Use one authorized room per conversation for transcript/state events. A separate workspace inbox room contains summaries and state changes only—never full message bodies.
- Postgres remains authoritative. PartyServer delivers live events and never decides whether an unpersisted message succeeded.
- Commit each durable state change and outbox event in the same Postgres transaction. Publish at least once; consumers deduplicate using stable event IDs and monotonic stream sequences.
- Attempt post-commit publication for low latency and retain a dispatcher for recovery. Reconnects reconcile from a persisted cursor; compacted cursors receive an authoritative snapshot.
- Revalidate access on connection and terminate affected connections after membership, visitor-session, or origin revocation.
- Use Durable Object hibernation and bounded room activity. Free-tier exhaustion degrades live delivery but does not lose accepted messages or activate a paid plan.

## 8. AI

Define three provider-neutral server-side contracts:

| Capability | PopSage-owned input/output | Adapter responsibility |
|---|---|---|
| Classification | Business scope + ordered conversation context → validated support-intent label and reason | Request mapping, structured-result validation, usage, timeout, quota, and error normalization |
| Generation | Authorized evidence + conversation context → candidate answer and source references | Provider mapping without changing evidence or conversation policy |
| Embeddings | Ordered text batch + explicit embedding profile → ordered, dimension-validated vectors | Model limits, batching, correspondence, usage, and invalid-vector rejection |

- Implement separate Cloudflare Workers AI and OpenAI adapters for all capabilities. Cloudflare is initially active; OpenAI remains inactive and must not require credentials or make calls.
- Select classification, generation, and embeddings independently through server-side configuration.
- No provider SDK type crosses the adapter boundary. PopSage owns retrieval, source eligibility, grounding, source traceability, handoff, and late-output suppression.
- Do not expose factual answer content until the complete answer passes grounding and state validation. Genuine visitor-facing token streaming is deferred.
- Do not automatically fall back to OpenAI or any paid service after quota exhaustion. Hand off or show a recoverable unavailable state.
- An embedding-profile change requires explicit re-embedding and compatible vector-index migration. Never reuse incompatible vectors silently.
- Pin exact provider/model identifiers after evaluation; do not follow mutable `latest` aliases.

Exact model IDs remain a measured implementation decision. Supporting a model in an adapter does not authorize or promote it.

## 9. Background work: Trigger.dev

Use Trigger.dev Free for work that must survive request completion:

| Job | Responsibility |
|---|---|
| Knowledge ingestion | Verify object → parse supported format → chunk → embed → atomically publish a Ready source version |
| Cleanup | Physically remove logically expired primary data within the approved 24-hour window |
| Conversation lifecycle | Close after 30 inactive days; mark unanswered conversations abandoned; apply post-closure retention |
| Embedding migration | Resumable backfill, validation, cutover, rollback window, and cleanup |
| Outbox recovery | Dispatch committed realtime events, preserve ordering, and quarantine poison events |

- Jobs are idempotent, bounded in concurrency, retryable, and workspace-scoped.
- Postgres owns authoritative job state. Trigger.dev run state and short-lived logs are operational aids.
- Pass identifiers rather than transcript/document bodies in job payloads when practical.
- Quota exhaustion must be visible and recoverable; never upgrade or enable overages automatically.

## 10. Storage and uploads

- Neon Object Storage holds private original knowledge documents.
- The browser uploads directly with short-lived, scoped presigned operations issued after application authorization and file-contract checks.
- Verify stored type, size, key prefix, and ownership after upload; a presigned URL or object path does not grant ongoing authorization.
- V1 supports text-based PDF, DOCX, and Markdown, up to 20 MB per file and 100 active documents per workspace. OCR is excluded.
- Owner confirmation that a document is visitor-safe is required before upload. Internal or audience-restricted documents are out of scope.
- Removing a source immediately excludes it from retrieval; cleanup of originals, chunks, vectors, and migrations follows the documented lifecycle.

The S3-compatible client and file parsers are selected when knowledge ingestion begins and recorded here with exact versions.

## 11. Configuration, secrets, and provider replacement

- Validate environment variables at server startup. Keep secrets and private endpoints server-only.
- Configure classification, generation, and embedding providers/models independently. Missing configuration fails closed and never selects a paid fallback.
- Keep auth, storage, realtime, jobs, classification, generation, and embeddings behind narrow adapters. Domain policy and authorization remain application-owned.
- Separate local/training configuration from any future pilot or production environment.
- Provide `.env.example` files containing names and safe descriptions only—never credentials.
- Provider replacement may require deliberate session, object, or embedding migration. Configuration-based switching does not make incompatible data portable automatically.

## 12. Testing and tooling

- Run `npm run lint`, `npm run typecheck`, and `npm run build` before a change is complete.
- Add automated tests with the first domain behavior; do not adopt the tutorial's “no automated tests” position.
- Planned test layers:
  - unit tests for state transitions, authorization policy, validation, routing, grounding, and adapter normalization;
  - integration tests for Postgres transactions/RLS, outbox ordering, retries, visitor-session rotation, and cross-workspace denial;
  - browser tests for widget installation, iframe origin checks, chat, reconnect, dashboard takeover, keyboard use, and narrow screens;
  - provider-contract tests using deterministic transports without paid calls;
  - versioned AI evaluations for classification accuracy, retrieval relevance, answer grounding, and provider switching.
- Use two fictional workspaces in isolation tests. Zero observed cross-workspace access and zero committed AI replies after handoff are release gates.
- Do not claim model quality from mocks or contract tests. Live paid-provider evaluation requires explicit approval.

Test runners are not installed yet. Prefer Vitest for TypeScript unit/integration tests and Playwright for browser tests unless the first testing slice reveals a material incompatibility.

## 13. Deployment and environments

| Target | Responsibility | Initial constraint |
|---|---|---|
| Local machine | Development, deterministic tests, fictional fixtures | Current authorized environment |
| Vercel Hobby | Next.js app, widget assets, HTTP APIs | Personal noncommercial training; no paid trial/upgrade |
| Neon Free | Postgres/pgvector, managed auth, private object storage | No Data API or paid gateway |
| Cloudflare Free | PartyServer/PartySocket and Workers AI | No paid Workers or automatic billing |
| Trigger.dev Free | Durable background jobs | No upgrade or overage activation |

Prefer US East where supported, but do not claim country-specific residency. Record actual regions and data destinations. Reassess privacy, residency, compliance, retention, email delivery, and operational coverage before real business/customer data.

No cloud target is provisioned by the Next.js bootstrap. Provisioning remains a separate, explicitly approved step.

## 14. Versions and documentation sources

| Component | Current baseline | Source to check before changing |
|---|---|---|
| Node.js | 20.9+ supported; scaffold created locally with 25.8.1 | Installed Next.js installation guide and Next.js release docs |
| Next.js | 16.4.4 | Installed `node_modules/next/dist/docs/` first; [Next.js docs](https://nextjs.org/docs) second |
| React / React DOM | 19.3.0 | [React docs](https://react.dev/) and installed Next.js compatibility guidance |
| TypeScript | 5.x | Lockfile and [TypeScript docs](https://www.typescriptlang.org/docs/) |
| Tailwind CSS | 4.x | Lockfile and [Tailwind docs](https://tailwindcss.com/docs) |
| PartyServer / PartySocket | Install when realtime starts; pin exact versions | [Cloudflare PartyKit repository](https://github.com/cloudflare/partykit) |
| Neon services | Account/version selection deferred until provisioning approval | [Neon docs](https://neon.com/docs) |
| Trigger.dev | Install when the first durable job starts; pin exact version | [Trigger.dev docs](https://trigger.dev/docs) |
| Workers AI | Exact model IDs deferred to evaluation | [Workers AI docs](https://developers.cloudflare.com/workers-ai/) |
| OpenAI adapter | Inactive; package/transport selected during adapter work | [OpenAI API docs](https://developers.openai.com/api/docs) |

`package-lock.json` is authoritative for installed JavaScript versions. Do not upgrade dependencies incidentally.

## 15. Deferred implementation decisions

1. Typed SQL/ORM and migration tooling after the RLS/pgvector/serverless comparison.
2. Exact Cloudflare models after free-tier evaluation.
3. Zod, form, Markdown, test, parser, and storage-client versions when their first slice begins. The component foundation is settled as shadcn/ui Base/Nova.
4. Embed-loader bundler and stable asset-caching contract.
5. Exact PartyServer event envelope, token claims, revocation signal, dispatcher cadence, and cursor compaction thresholds.
6. Chunking, embedding dimensions, similarity thresholds, and index type after evaluation fixtures exist.
7. Physical schema and repository modules; the glossary defines the domain without mandating a table layout.

Deferred means “decide at the responsible implementation slice,” not “silently inherit the tutorial's choice.” Consequential selections must update this document and, where hard to reverse, receive an ADR.
