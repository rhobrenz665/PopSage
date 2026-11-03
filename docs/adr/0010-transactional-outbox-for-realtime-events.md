# Publish realtime events through a transactional outbox

Accepted on 3 November 2026 (Q39/Q41). Commit each durable message or conversation-state change and its outbox event in the same Postgres transaction. A retryable dispatcher publishes the event to PartyServer; publication is at-least-once, so event identities and consumers must be idempotent. A database rollback produces neither durable state nor a publishable event.

Each conversation has its own PartyServer room containing transcript and conversation-state events for authorized participants. A separate workspace inbox room carries only conversation summaries and state changes, never full message bodies. PartyServer remains transport rather than transcript authority; reconnecting clients reconcile against persisted Postgres state using an application-defined cursor.

Assign every conversation event a monotonically increasing conversation sequence inside the same transaction as the durable state change; workspace inbox events use an independent workspace sequence. After commit, the request may attempt immediate PartyServer publication for latency, while the outbox dispatcher remains the recovery path. Stable event IDs and sequence-aware consumers make duplicate publication harmless. Clients reject already-applied sequences, detect gaps, and fetch persisted state/events before continuing.

Repeatedly failing events are quarantined rather than dropped. Create a metadata-only operator alert and prevent later events in the same ordered stream from overtaking the failed sequence. Recovery retries publication or uses an explicitly authorized, auditable supersession that preserves reconstructable durable state; it must never hide or delete an accepted message.

Retain successfully published outbox events for seven days. A client presenting an older or compacted cursor receives an authoritative conversation transcript or workspace-inbox snapshot, then resumes from a newly issued cursor. Compaction never shortens transcript retention, edits accepted messages, or removes unpublished/quarantined events.

Authorization is checked at room connection and on protected catch-up requests, and access changes terminate affected connections. Outbox retries must preserve per-conversation ordering, respect transcript expiry/source removal, and avoid publishing an event that no longer has an authorized durable representation. Exact dispatcher runtime, retry schedule, cursor retention, compaction, quarantine threshold, and supersession authority remain engineering decisions.

This ADR records planning only and does not authorize implementation or deployment.
