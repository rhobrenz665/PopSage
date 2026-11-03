# PopSage v1 — product brief

Status: Product baseline approved; engineering validation pending · 3 November 2026  
Source: Founder brief and the two supplied architecture/user-flow images. The local Next.js scaffold is initialized; no customer research, deployed application, or measured performance is established. Infrastructure research is tracked separately and does not constitute deployment validation.

## Current project direction

PopSage is a personal software engineering training project. The initial environment uses fictional businesses, sample websites, and approved test documents; no real business participation or paying customers are assumed. The project owner is the initial coordinator and tester.

Apply production-ready engineering practices while targeting **US$0/month** through free-tier infrastructure. Preserve authorization and workspace isolation, keep the MVP operationally simple, and support later growth through configurable providers and narrow integration boundaries. US$50/month is only an optional future pilot scenario, not an approved expense. Do not purchase or activate paid services without explicit approval.

Local implementation is authorized and began with the Next.js application scaffold on 3 November 2026. Cloud provisioning, paid services, billing activation, and real business/customer data remain separately gated. This direction supersedes earlier assumptions of an imminent real-business pilot. The product roles below describe the intended application, initially exercised with fictional test identities.

## Problem

Website visitors need trustworthy answers without waiting unnecessarily, while business support teams need to reserve their attention for questions that require human judgment. The working hypothesis is that repetitive questions can be answered from a business’s existing documents, provided uncertainty leads reliably to a human.

## Intended outcome

A business installs PopSage on a real website, uploads its support knowledge, and receives visitor conversations in one dashboard. The AI answers supported questions from that business’s knowledge, declines unrelated requests, and hands off when it cannot answer or the visitor requests a person. Humans continue the same conversation with its history intact.

## Users and scope

| User | Core job |
|---|---|
| Business owner | Set up a workspace, install the widget, manage knowledge and team access. |
| Support teammate | See incoming conversations, take ownership, reply, and close conversations. |
| Website visitor | Ask a question, receive a grounded answer, and reach a human without repeating context. |

Confirmed v1 scope: embeddable widget, real-time chat, team dashboard, uploaded knowledge, RAG answers, classification before AI answering, polite off-topic refusal, and human handoff.

Explicitly excluded by the founder: email/ticketing, a help center, product tours, native mobile applications, billing, and pricing plans. Approved additional exclusions: website crawling, external business-system actions, voice, visitor file attachments, advanced routing, and an analytics product. Responsive web widget behavior remains in scope.

## PRD map

| Document | Responsibility |
|---|---|
| [Architecture and workflow diagrams](../architecture/diagrams.md) | Simple visual summary of the approved system and A/B/C flows. |
| [Technology stack](../architecture/tech-stack.md) | Implementation source of truth for frameworks, providers, boundaries, tooling, and deferred technical selections. |
| [01 — Live chat and workspace](01-live-chat-and-workspace.md) | Installation, access, durable messaging, inbox, and human replies. |
| [02 — Knowledge ingestion](02-knowledge-ingestion.md) | Flow A: upload, process, publish, retry, and remove knowledge. |
| [03 — AI support and handoff](03-ai-support-and-handoff.md) | Flows B/C: classify, retrieve, answer or decline, and transfer control. |
| [Delivery and decisions](04-delivery-and-decisions.md) | Architecture intent, shared constraints, measurement, release gates, and remaining engineering validation. |
| [Shared-understanding handoff](05-shared-understanding.md) | Settled baseline, remaining engineering validation, and authorization boundary. |

The founder’s explicit scope and selected technologies are requirements. The founder approved the suggested defaults, scope additions, and numerical targets on 3 November 2026. These are the v1 product baseline; targets still require measurement, and approval does not establish technical feasibility or commit unspecified dates, budgets, or providers. Detailed requirements below shape the requested product; they do not imply that implementation or validation has occurred.

## Success

The primary outcome is a useful answer or a successful continuation with a human, not simply fewer human conversations. Current evaluation uses fictional businesses and sample sites. The earlier three-business, two-week pilot is a possible future phase, contingent on real-business recruitment, validation, data review, and explicit authorization. Track task completion in observed sessions, grounded answer quality, and successful handoff. A single sample-site end-to-end demonstration is the minimum working-product milestone. Definitions and approved targets are in [Delivery and decisions](04-delivery-and-decisions.md#success-measures).

## Delivery boundary

Build and demonstrate a complete slice first: install → upload → ask → answer → request human → human replies → close. A future real pilot additionally requires business representatives to validate answers and a privacy, data residency, and compliance reassessment. Delivery dates and staffing remain open; establish them with engineering before committing a release date.

## Design interview — accepted 3 November 2026

- Focus training scenarios and any future pilot on general product and policy support. Account-specific requests go to humans; no customer-account lookup or business actions in v1.
- Use scheduled testing windows with the project owner exercising the human-support role; a future pilot must arrange real staffing. Replies appear in the chat and are not guaranteed to be immediate. A visitor who leaves may never receive a later reply; no email or cross-device delivery guarantee is implied.
- Upload visitor-safe knowledge only. Internal documents and audience-specific permissions are deferred; see [the disclosure-boundary ADR](../adr/0001-visitor-safe-knowledge-only.md).
- Prove the complete experience on one sample website before considering a real-business pilot. Estimate pilot delivery after that slice; no launch date is committed.

Canonical terms are recorded in [the glossary](../../GLOSSARY.md). The design interview concluded with shared understanding on 3 November 2026; the earlier accepted decisions and final confirmation do not authorize implementation.

### Second interview round — accepted 3 November 2026

- One workspace represents one support operation across one or more websites; distinct brand knowledge requires separate workspaces. See [workspace boundary ADR](../adr/0002-workspace-support-boundary.md).
- Teammates claim unassigned conversations and transfer their own; only the workspace owner forcibly reassigns another teammate’s conversation.
- Closed conversations expire after 30 days; knowledge stays until owner removal. Inactive conversations automatically close after 30 days; unanswered conversations are abandoned, not resolved. Infrastructure deletion details remain open.
- The platform operator controls fictional training-workspace admission and would approve businesses for a future pilot, and workspace owners control team admission. Public signup is deferred.
- Research the remaining providers for low operational effort and transparent estimated costs. Provider selection and paid provisioning are not approved by this research authorization.

### Q10–Q14 — accepted with revisions, 3 November 2026

- Automatically close conversations after 30 days without a conversational message; expire them 30 days after closure. Unanswered requests are abandoned, never counted as resolved. New messages after closure start a new conversation; see PRD 01 for lifecycle and race handling.
- Initial budget is US$0/month. Research free allowances, quota exhaustion, billing exposure, and upgrade paths across every service. Trial credits are not a sustainable free tier. The optional future US$50 scenario is not approval to spend.
- The project owner coordinates and tests fictional businesses, sample sites, and approved documents. Actual business representatives must validate answers before any real customer pilot.
- Platform operation confers no transcript-reading entitlement. Troubleshooting requires explicit workspace-owner authorization, an auditable reason, and narrowly scoped access.
- Training has no country-specific hosting requirement. Record regions and data destinations, then reassess privacy, residency, and compliance before introducing real business or customer data.

See [infrastructure research](../research/infrastructure-options.md), [training deployment ADR](../adr/0003-free-tier-training-environment.md), and [operator-access ADR](../adr/0004-explicit-troubleshooting-access.md).

### Q16 — approved OpenAI-ready architecture, 3 November 2026

Cloudflare Workers AI is the initial active provider for classification, generation, and embeddings. Design provider-independent interfaces and separate Cloudflare/OpenAI adapters from the beginning, with independent provider/model configuration for each capability. OpenAI is a future inactive provider, not an automatic fallback. Embedding changes require explicit re-embedding and vector-index migration; RAG, isolation, attribution, and grounding protections are unchanged.

See [AI architecture ADR](../adr/0005-independent-ai-providers.md) and [the provider evaluation plan](03-ai-support-and-handoff.md#provider-independent-evaluation-plan). US$0 remains the initial budget; paid activation requires explicit approval. Local implementation is now authorized, but provider provisioning and live model calls remain separately gated.

### Q15 — approved realtime successor, 3 November 2026

Use PartyServer with PartySocket on Cloudflare Workers and Durable Objects for realtime delivery, replacing the retired hosted PartyKit deployment path. Postgres remains authoritative; PartyServer transports authorized live events and must support reconnect recovery, access revocation, and quota-safe degradation. See [ADR 0006](../adr/0006-partyserver-for-realtime.md). Local implementation is authorized; deployment, account creation, and paid activation are not.

### Q17–Q19 — approved training services, 3 November 2026

Use Vercel Hobby for the Next.js application, Neon Free for Postgres/pgvector, owner/team authentication, and private object storage, and Trigger.dev Free for durable background jobs. PopSage retains authorization and domain policy; Postgres remains authoritative for application and job state. Free-tier exhaustion must fail visibly without automatic paid upgrade or overage. See [ADR 0007](../adr/0007-free-tier-training-service-stack.md). Local implementation does not authorize provisioning these services.

### Q20–Q23 — approved operating defaults, 3 November 2026

- Prefer US East for the fictional training environment where supported; document all data destinations and do not present this as a residency guarantee.
- Workspace owners admit teammates using single-use, expiring email invitations. Public self-registration is disabled; authentication alone does not grant membership.
- Transcript troubleshooting grants last at most 24 hours, are immediately revocable, and retain content-free audit metadata for 90 days. Transcript expiry ends access earlier.
- Support the latest two stable desktop versions of Chrome, Edge, Firefox, and Safari, plus current Chrome on Android and Safari on iOS. Explicitly test iframe storage, reconnects, keyboards, accessibility, and narrow screens.

These defaults apply to planning and future training validation. They do not authorize service setup or implementation.

### Q24–Q26 — approved session and onboarding defaults, 3 November 2026

- The host-page loader keeps an opaque, origin-scoped visitor-session handle in first-party browser storage and gives the iframe short-lived access credentials. Do not depend on third-party iframe storage. Clearing site data creates a new anonymous identity; cross-origin, browser, and device continuity are unsupported. See [ADR 0008](../adr/0008-first-party-anonymous-visitor-sessions.md).
- Teammate invitations are addressed, single-use, revocable, and expire after 72 hours. Replacement invalidates the earlier invitation.
- Use Neon’s shared development email facility only for fictional training invitations and authentication messages. Require reviewed custom SMTP before real users; no production delivery reliability is claimed.

Visitor credential lifetimes were settled in Q27 below. These are planning decisions only.

### Q27–Q30 — approved lifecycle and model candidates, 3 November 2026

- Iframe access credentials expire after 15 minutes. Rotating first-party visitor handles expire after 90 days of inactivity.
- Removing an allowed origin immediately revokes its visitor credentials and realtime connections. Re-adding it does not revive them.
- Logically expired transcripts and sessions become inaccessible immediately and are removed from primary storage within 24 hours by retryable cleanup jobs. Provider backup retention is documented separately. See [ADR 0009](../adr/0009-logical-expiry-and-physical-cleanup.md).
- Initially evaluate Cloudflare’s Llama 3.1 8B Instruct candidate for classification/generation and BGE Small English v1.5 for embeddings. They are replaceable candidates and must pass shared quality, retrieval, latency, and quota tests before activation.

No model calls, provisioning, cleanup implementation, or deployment is authorized by these decisions.

### Q31–Q34 — approved promotion, quota, backup, and credential controls, 3 November 2026

- Every AI model/configuration change requires a versioned evaluation report, exact model pin, manual promotion, and known rollback target. Do not follow mutable model aliases.
- Stop admitting new AI work at 80% of the estimated Cloudflare daily free allowance and run no more than two AI pipelines concurrently. Values remain configurable and evidence-driven; never fall back automatically to paid OpenAI.
- Fictional training may use documented provider-managed backup schedules. Real business/customer data is prohibited until retention, deletion, restore, and privileged-access behavior is reviewed.
- Store only a hash of each high-entropy rotating visitor handle. Use signed 15-minute iframe tokens that reference the session without transcript content, and check current origin/session state on every protected request and realtime connection.

These are planning controls only; no model activation, account setup, or implementation is authorized.

### Q35–Q38 — approved critical gates and signing controls, 3 November 2026

- AI promotion requires all approved PRD thresholds and zero observed cross-workspace retrieval/disclosure, post-handoff AI replies, or unsupported material claims in the versioned evaluation set. Any critical failure blocks promotion.
- Cleanup retries within the 24-hour window. A missed deadline creates a metadata-only operator alert while the data remains logically inaccessible.
- Before any resource creation, verify recurring-free eligibility, payment-method requirements, billing/overage settings, and exhaustion behavior. Stop if paid activation, a card, or automatic overage is required.
- Vercel signs 15-minute iframe access tokens with Ed25519. PartyServer and protected APIs verify public keys identified by key ID, while still checking current session/origin state. Support overlapping public keys during controlled rotation.

These decisions do not authorize account creation, implementation, or key generation.

### Q39–Q42 — approved persistence, isolation, and realtime controls, 3 November 2026

- Commit durable conversation changes and outbox events atomically in Postgres. Publish to PartyServer with at-least-once delivery and idempotent consumers; reconnect by persisted cursor. See [ADR 0010](../adr/0010-transactional-outbox-for-realtime-events.md).
- Enforce tenant isolation with application authorization plus Postgres row-level security. Fail closed without trusted transaction context and narrowly scope background service roles. See [ADR 0011](../adr/0011-defense-in-depth-tenant-isolation.md).
- Use one PartyServer room per conversation. Workspace inbox rooms carry summaries/state changes only, never full message bodies.
- Show missed-cleanup alerts in an operator-only dashboard and metadata logs. Deduplicate them and keep them open until cleanup succeeds or an operator records resolution. External paging is deferred.

These decisions now guide local implementation; cloud resource creation and deployment remain separately gated.

### Q43–Q46 — approved ordering and transcript controls, 3 November 2026

- After database commit, the request attempts immediate PartyServer publication; the outbox dispatcher supplies durable recovery. Duplicate delivery is expected and deduplicated by stable event ID.
- Assign monotonic per-conversation sequence numbers transactionally. Workspace inbox events have an independent workspace sequence. Clients detect gaps and reconcile persisted events/state.
- Accepted visitor, teammate, and AI messages are immutable in v1. Corrections are new messages; retention removes transcripts according to lifecycle policy.
- Quarantine repeatedly failing outbox events and emit metadata-only alerts. Do not drop them or allow later events in the same stream to overtake them; any supersession is explicit, auditable, and cannot hide durable accepted messages.

These decisions now guide local implementation.

### Q47–Q50 — approved workspace, membership, and event lifecycles, 3 November 2026

- Workspace deletion requires owner reauthentication and explicit name confirmation. It immediately disables access/work and starts irreversible primary-data cleanup within 24 hours; provider backups follow documented schedules.
- Removing a teammate immediately revokes that workspace membership and live access. Historical messages retain immutable display-name/sender-type snapshots; the account may remain active elsewhere.
- Each workspace has exactly one owner. Ownership transfers only to an active teammate who explicitly accepts; the current owner cannot leave first.
- Retain successfully published outbox events for seven days. Older clients receive an authoritative transcript/inbox snapshot and a new cursor. Never compact unpublished/quarantined events or shorten transcript retention.

See [workspace lifecycle ADR](../adr/0012-workspace-and-membership-lifecycle.md) and [outbox ADR](../adr/0010-transactional-outbox-for-realtime-events.md). No deletion, implementation, or provisioning is authorized.

### Q51–Q54 — approved account, abuse, validation, and MFA boundaries, 3 November 2026

- Account deletion requires resolving every owned workspace. Revoke sessions/memberships immediately, remove the primary auth profile within 24 hours, and anonymize retained sender display names to “Deleted teammate”; accepted content remains immutable.
- Limit visitor messages to 4,000 Unicode characters, 10 accepted messages per minute per visitor session, and 30 per minute per allowed origin. Limits are configurable and run before AI work.
- Reject empty, whitespace-only, malformed, and over-limit messages before persistence. Never truncate silently; failed submissions remain editable drafts and do not reset inactivity.
- MFA is outside the fictional training MVP. Require recent reauthentication for workspace deletion, ownership transfer, transcript-access grants, and account deletion. Reassess MFA before real users or data.

These are planning decisions only.

### Q55–Q58 — final decisions and shared understanding, 3 November 2026

- Owners and teammates can use verified email/password, Google OAuth, or magic-link authentication. Membership still requires an accepted workspace invitation, and signup is invitation-gated; password recovery and magic links use development email only for fictional identities.
- Widget origins require exact normalized scheme, hostname, and port matching. HTTPS is mandatory except HTTP localhost during development. Wildcards and malformed/deceptive origin forms are rejected.
- Account export, advanced conversation search, individual-message redaction, MFA, and external operational paging remain outside the training MVP. Reassess privacy/export, redaction, MFA, and operations before real users/data.
- The founder confirms shared understanding of the product and architecture design tree. The product decision frontier is empty for this planning session.

Exact schemas, SQL/RLS mechanics, token claims, retry/quarantine thresholds, key procedures, provider-account verification, backup schedules, and measured model results remain engineering validation. See [the shared-understanding handoff](05-shared-understanding.md). Local implementation is authorized; account creation, provisioning, deployment, paid activation, and real data are not.
