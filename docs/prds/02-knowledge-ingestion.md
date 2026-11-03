# PRD 02 — Knowledge ingestion

Status: Product baseline approved · Priority: v1 required · Covers: Flow A · Related: [Product brief](README.md)

Initial validation uses fictional business knowledge and approved test documents. No real business or customer data is required for training. File-count and size ceilings remain product limits, not a promise that free infrastructure can hold every workspace at its maximum.

## Problem and outcome

Business owners need to know which of their support documents the AI can actually use. A successful upload alone is insufficient: content must be readable, searchable, current, and isolated to the correct business before it informs answers.

Success means an owner uploads a supported document, understands processing progress or failure, and sees grounded answers use it only after processing completes.

## Scope and defaults

The founder requests PDFs, docs, and Markdown. Approved initial formats: text-based `.pdf`, `.docx`, and `.md`; the approved v1 interpretation of “docs” is DOCX and does not include `.doc`, Google Docs links, or arbitrary formats. Approved exclusions: OCR, scanned/image-only documents, password-protected documents, web crawling, and third-party synchronization.

Approved initial limits: 20 MB per file and 100 active documents per workspace. These are configurable operational limits, unrelated to billing, and must be validated with representative documents. All uploaded documents must be visitor-safe: owners confirm the content is suitable for any website visitor before upload. Internal staff documents and audience-specific permissions are outside v1. Only owners manage knowledge in v1; teammates may see source references supporting an answer.

## Flow A

1. Owner selects a file in the dashboard and sees supported formats and limits.
2. Server checks owner access and limits, creates a document record, and issues a scoped, expiring upload URL.
3. Dashboard uploads directly to private Neon Object Storage through a scoped, expiring URL and reports upload progress.
4. The server verifies upload completion; background ingestion extracts text, creates chunks, and requests embeddings through the configured provider boundary (initially Cloudflare Workers AI, with an OpenAI adapter designed for future use).
5. The ingestion process stores workspace-scoped text and vectors in Postgres with pgvector.
6. Once all required work succeeds, the document becomes Ready and eligible for retrieval. The dashboard shows status without requiring an owner to guess whether the AI has learned the content.

## Functional requirements

| ID | Requirement |
|---|---|
| KB-01 | Validate authorization, file size, and format before granting upload access; verify the stored object independently before processing. Uploaded filenames and contents are untrusted input. |
| KB-02 | Restrict upload URLs to their intended object and operation, with an expiry. Original files are private; storage paths do not substitute for authorization. |
| KB-03 | Show a document list with filename, upload time, state, and actionable failure reason. Use Uploading → Processing → Ready, with Failed and Removing/Removed paths. A failed transfer cannot appear Ready. |
| KB-04 | Preserve source metadata sufficient to connect each retrieved chunk to its document/version and page or section where available. Do not claim a page reference when extraction cannot supply one. |
| KB-05 | Publish a document’s searchable content atomically after successful processing. Partial embeddings or partial parsing do not expose an incomplete document as Ready. Previously Ready documents remain available when another ingestion fails. |
| KB-06 | Make processing safe to retry after worker failure or duplicate upload-completion events. One logical document version must not produce duplicate active chunks. Bound retries and show a recoverable failure when exhausted. |
| KB-07 | Explain unreadable, empty, encrypted, unsupported, and over-limit files. Provide retry for transient failures and remove/re-upload for invalid input. Do not silently treat an empty extraction as success. |
| KB-08 | Allow owners to remove knowledge. Exclude it from new retrieval immediately when removal is accepted, and prevent in-flight answers using that source from being committed after removal. Finish original-file/chunk cleanup asynchronously and report failures operationally. |
| KB-09 | Approved update behavior: upload a new document and explicitly remove the old one; no version editor or automatic replacement in v1. Warn that overlapping/conflicting active documents can cause escalation. |
| KB-10 | Enforce workspace scope in storage access, jobs, chunks, retrieval, and source viewing. A job payload alone is not proof of authorization or ownership. |
| KB-11 | Store the embedding profile and index version with chunks; require a compatible query profile. Provider/model/dimension changes follow explicit re-embedding, validation, cutover, and rollback in ADR 0005. Equal dimensions do not imply compatibility. |

Removed material is unavailable for future answers. Existing conversation text is historical and is not automatically rewritten when a source is removed; source labels may remain with an unavailable-source indication. Transcript deletion/retention is a separate policy decision.

## Acceptance scenarios

- **Supported content:** For a representative PDF, DOCX, and Markdown file, Ready means an agreed support question can retrieve the expected passage within the correct workspace.
- **Failure visibility:** An image-only PDF or malformed document receives a useful failure explanation and contributes no searchable chunks.
- **No partial publication:** A forced embedding failure halfway through leaves no partial active document; retry produces one complete searchable document.
- **Isolation:** A document uploaded to workspace A cannot be downloaded, listed, retrieved, or cited by workspace B.
- **Removal race:** Remove a document while an answer using it is pending; the pending answer is discarded or recomputed against active knowledge, and later questions cannot retrieve it.
- **Freshness:** Upload new conflicting policy text while old text remains active; the system does not silently invent which policy supersedes the other. Conflict behavior follows PRD 03.

## Embedding-provider migration

Follow [ADR 0005](../adr/0005-independent-ai-providers.md): prepare a separate compatible index, re-embed eligible source content, validate retrieval and source attribution, reconcile concurrent document changes, and atomically switch query/profile selection. A configuration edit alone cannot activate incompatible vectors. Source removal applies to old and new index versions, including rollback copies. Bound migration work by free quotas; pause on insufficient capacity rather than enabling billing. Specific vector schema, migration tooling, and rollback retention remain engineering design decisions.

## Measurement and dependencies

Approved target: at least 95% of supported, readable test documents up to 5 MB become Ready within two minutes of verified upload completion under a documented quota-safe training load; revalidate at future pilot capacity. Report success rate and latency by format; unsupported documents are measured separately, not hidden as processing successes.

Dependencies: Neon private object storage, upload verification, Trigger.dev durable background execution with retries, text parsers, the independently configured embedding adapter (initially Cloudflare Workers AI; future OpenAI), and workspace-scoped Neon Postgres/pgvector. Postgres records authoritative job outcomes; Trigger.dev run status and logs do not replace application state. Exact chunking, embedding model, vector dimensions, and retrieval tuning belong in an engineering design validated against the answer-quality set.

Remaining validation and decisions: tested limits, maximum processing duration, deletion cleanup deadline, and source retention policy. No specific storage or worker provider is assumed from the architecture image alone.
