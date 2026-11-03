# PopSage v1 — architecture and workflow diagrams

Status: Updated planning view · 3 November 2026

These diagrams summarize the approved design. They intentionally omit detailed retention, migration, quota, audit, and failure-policy mechanics documented in the PRDs and ADRs.

Downloadable exports: [system architecture](./popsage-architecture.svg) · [product workflow](./popsage-workflow.svg)

## System architecture

```mermaid
flowchart LR
    subgraph WEB[Website and dashboard]
        LOADER[Host-page loader<br/>first-party visitor handle]
        WIDGET[Chat widget<br/>iframe]
        DASH[Team dashboard]
        LOADER --> WIDGET
    end

    subgraph VERCEL[Vercel Hobby]
        NEXT[Next.js API<br/>authorization and orchestration]
        OUTBOX[Post-commit publisher<br/>and outbox dispatcher]
    end

    subgraph NEON[Neon Free]
        AUTH[Managed Better Auth<br/>owner and teammates]
        DB[(Postgres + pgvector<br/>authoritative data + RLS)]
        STORE[Private Object Storage<br/>uploaded documents]
    end

    subgraph CLOUDFLARE[Cloudflare Free]
        PARTY[PartyServer + PartySocket<br/>authorized realtime rooms]
        CFAI[Workers AI<br/>classify + generate + embed]
    end

    JOBS[Trigger.dev Free<br/>ingestion + cleanup + migrations]
    OPENAI[OpenAI adapters<br/>future and inactive]

    WIDGET -->|HTTPS commands| NEXT
    DASH -->|HTTPS reads and commands| NEXT
    DASH -->|login and session| AUTH

    NEXT -->|server-side SQL transactions<br/>no Data API in current plan| DB
    NEXT -->|presigned upload flow| STORE
    NEXT -->|classification and answers| CFAI

    DB -->|transactional outbox| OUTBOX
    OUTBOX -->|at-least-once publish| PARTY
    PARTY <-->|live events| WIDGET
    PARTY <-->|inbox and conversation events| DASH

    JOBS -->|read files| STORE
    JOBS -->|job state + chunks + vectors| DB
    JOBS -->|embeddings and AI work| CFAI
    NEXT -.->|configuration-based future switch| OPENAI
    JOBS -.->|configuration-based future switch| OPENAI
```

Key interpretation:

- Postgres is authoritative. PartyServer delivers live events but is not the transcript store.
- Next.js and Trigger.dev use server-side Postgres access; Neon Data API is not part of the current plan.
- Cloudflare Workers AI is active initially. Separate OpenAI adapters exist in the future design but cannot activate automatically.
- Application authorization and Postgres RLS both enforce workspace isolation.

## Product workflow

```mermaid
flowchart TD
    subgraph A[Flow A — owner uploads knowledge]
        A1[Dashboard requests upload URL]
        A2[Upload to private Neon Object Storage]
        A3[Trigger.dev validates and parses file]
        A4[Create chunks]
        A5[Configured embedding adapter<br/>Cloudflare initially]
        A6[(Store chunks + vectors<br/>in workspace-scoped Postgres)]
        A7[Atomically mark document Ready]

        A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7
    end

    subgraph B[Flow B — visitor asks a question]
        B1[Loader restores or creates visitor session]
        B2[Widget sends message]
        B3[Validate origin, token, content, and limits]
        B4[Persist visitor message + outbox event]
        B5{Support intent?}
        B6[Politely decline]
        B7[Embed question and retrieve active chunks]
        B8{Evidence sufficient and consistent?}
        B9[Generate answer from evidence]
        B10[Validate grounding and source attribution]
        B11[Recheck conversation state and source eligibility]
        B12[Persist reply + outbox event]
        B13[PartyServer delivers persisted event]

        B1 --> B2 --> B3 --> B4 --> B5
        B5 -->|No| B6 --> B12
        B5 -->|Yes| B7 --> B8
        B8 -->|Yes| B9 --> B10 --> B11 --> B12 --> B13
    end

    subgraph C[Flow C — handoff to a human]
        C1[Enter WAITING_HUMAN<br/>cancel pending AI reply]
        C2[Show waiting state and handoff reason]
        C3[Teammate claims conversation atomically]
        C4[Enter HUMAN_ACTIVE]
        C5[Human reply is persisted + published]
        C6[Close manually or after 30 inactive days]

        C1 --> C2 --> C3 --> C4 --> C5 --> C6
    end

    B8 -->|No or conflicting evidence| C1
    B4 -->|Visitor explicitly requests human| C1
    B4 -->|AI unavailable or quota stopped| C1
```

The original A/B/C product logic remains intact. The updated workflow adds durable persistence before realtime delivery, configurable AI providers, evidence validation, explicit cancellation during handoff, and reliable background processing.

## Main changes from the original diagrams

| Original label or implication | Updated design |
|---|---|
| PartyKit | PartyServer + PartySocket on Cloudflare Workers and Durable Objects |
| OpenAI always handles AI and embeddings | Cloudflare Workers AI initially; independent future OpenAI adapters |
| Generic Functions | Trigger.dev durable jobs for ingestion, cleanup, and migrations |
| Generic Auth | Neon Managed Better Auth plus PopSage workspace authorization |
| Generic Object Storage | Private Neon Object Storage with scoped presigned operations |
| Publish directly to realtime | Persist state and outbox event first, then publish and retry safely |
| AI streams unchecked output | Validate the complete grounded answer before exposing factual content |
| AI stops after human takeover | AI stops as soon as the conversation enters `WAITING_HUMAN` |
| Database access unspecified | Server-side Postgres access with application authorization and RLS; no Data API currently |
