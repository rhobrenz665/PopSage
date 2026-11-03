# Use independent AI capabilities with Cloudflare and OpenAI adapters

Accepted on 3 November 2026 (Q16). Cloudflare Workers AI is the initial active provider for classification, text generation, and embeddings at the US$0 training budget. Design separate Cloudflare Workers AI and OpenAI adapters from the beginning, behind provider-independent capability interfaces; OpenAI remains inactive until explicitly selected and any paid use is authorized. This supersedes the earlier single-active-provider-only adapter scope, not the prohibition on implementation or provisioning.

## Capability boundaries

| Interface | Application-owned contract | Provider adapter responsibility |
|---|---|---|
| Classification | Business scope and ordered conversation context in; validated support-intent result and reason code out. Intent labels and routing policy are defined by PopSage. | Translate model requests, parse and normalize results, reject missing/invalid labels, and report operational errors distinctly from off-topic classifications. |
| Text generation | Context and authorized evidence with source IDs in; candidate answer and source references out. PopSage validates grounding before publication. | Map request/response formats, model capabilities, usage, limits, and errors without changing evidence or conversation policy. |
| Embeddings | Text batches plus an explicit embedding profile in; ordered vectors with profile identity and validated dimensions out. | Handle model input limits and batching, preserve input/vector correspondence, and reject invalid vectors or profile mismatches. |

The two adapters each support these three capability contracts. Classification may use an underlying text model internally, but remains independently configured and tested. No provider-specific SDK types should escape into business logic. Shared operational metadata includes provider/model identity, request/configuration version, latency, and available usage/cost units; missing usage is unknown, not zero. Retryability, quota exhaustion, timeout, invalid output, and configuration errors must be distinguishable.

PopSage owns workspace authorization, retrieval, source eligibility, grounding checks, handoff, and late-response suppression outside adapters. Neither adapter is allowed to relax these safeguards. No separate commercial gateway is required merely to supply these interfaces.

Every model or prompt/configuration promotion requires a versioned evaluation report and a manual configuration change. Pin exact provider/model identifiers rather than following mutable `latest` aliases. Record prompts, embedding/index profile, dataset and rubric versions, quality/retrieval/routing results, latency, quota usage, and rollback target. An adapter supporting a model does not make that model eligible for promotion.

Promotion requires every approved PRD threshold to pass and zero observed critical failures in the evaluation set: cross-workspace retrieval/disclosure, an AI reply committed after handoff/takeover, or a material factual claim unsupported by active eligible sources. Any critical failure blocks promotion regardless of aggregate score. Passing a finite evaluation does not prove universal absence; retain runtime controls and monitoring.

## Configuration and activation

Define independent server-side provider and model selectors for generation, classification, and embeddings, with Cloudflare as all three defaults. Illustrative names are `AI_GENERATION_PROVIDER/MODEL`, `AI_CLASSIFICATION_PROVIDER/MODEL`, and `AI_EMBEDDING_PROVIDER/MODEL`; exact names are an implementation decision. Credentials, endpoints, model capabilities, limits, and embedding-profile/index versions are also configuration, never public widget settings.

Generation and classification can be switched independently without business-logic edits. Validate configuration before use and snapshot it for an in-flight operation so a switch cannot mix response assumptions. Selecting an embedding provider requests a migration under the strategy below, not an immediate query/index cutover. An inactive OpenAI adapter must not require credentials, make network calls, follow an automatic model upgrade, or serve as an automatic fallback. Invalid configuration fails closed with an actionable error. Selecting a paid provider or supplying its credentials is not spending approval; keep explicit authorization and a bounded usage policy as separate activation prerequisites.

## Embedding migration

1. Identify each index version by workspace, provider, model/revision, dimensions, preprocessing/chunking version, and applicable normalization/distance configuration. Equal dimensions alone do not establish vector compatibility.
2. On any incompatible profile change, require an explicit migration plan and authorization for any billable work. Create a separate target index/version; preserve the current query/index pair while backfilling only active, authorized source versions. If the old provider is unavailable, hand off rather than querying its index with new vectors.
3. Re-embed and, where model input limits require it, re-chunk source content. Track resumable progress and quota usage, preserve source attribution, and reconcile uploads/removals during migration so deleted knowledge cannot return.
4. Validate completeness, workspace isolation, retrieval relevance, and grounded answer quality on the new profile. Capacity for parallel indexes must fit available free storage; otherwise pause migration and choose an explicit staged maintenance plan. No automatic upgrade is permitted.
5. Atomically activate the new index and matching query-embedding profile. Pin in-flight retrieval to a consistent version, while still rechecking source deletion and conversation state before publishing answers.
6. Keep a documented, bounded rollback window and cleanup plan. Rollback selects a complete matching profile/index pair, never mixed vectors; source removals remain authoritative across retained versions. Final window and physical schema/index layout remain engineering decisions.

## Tradeoff and verification

Two adapters and independent capability contracts add bounded up-front work, avoiding a later rewrite when OpenAI is enabled. Do not generalize into a provider marketplace or pre-build unrelated adapters. Shared evaluation requirements live in PRD 03, including independent and mixed-provider switching, migration, quota failure, and unchanged grounding behavior.

When implementation is later authorized, OpenAI contract tests can use fixtures/mocked transport without billable calls. These establish integration behavior, not actual OpenAI output quality. Live OpenAI evaluation remains explicitly gated; no test suite may silently enable billing. This ADR records design only.
