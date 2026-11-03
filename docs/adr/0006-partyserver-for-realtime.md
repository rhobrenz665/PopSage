# Use PartyServer on Cloudflare for realtime delivery

Accepted on 3 November 2026 (Q15). Use PartyServer with PartySocket on Cloudflare Workers and Durable Objects as PopSage's realtime delivery layer, replacing the original hosted PartyKit deployment path that retired on 23 October 2026. This preserves the room and connection model while targeting Cloudflare's free tier for the training environment.

Postgres remains the authoritative conversation record. PartyServer transports authorized live events; it does not decide workspace membership, own durable transcript truth, or make an unpersisted message successful. Connections must be authorized at establishment and revalidated when relevant membership or visitor-session state changes. Reconnects recover persisted events through the transactional outbox/cursor design in ADR 0010.

Each conversation has a dedicated room for its authorized participants. A workspace inbox room carries summaries and state changes only, never full message bodies.

Use hibernation and bounded room activity to stay within free limits. Quota exhaustion must surface as degraded realtime delivery while persisted HTTP/API paths remain recoverable; it must not activate a paid Cloudflare plan automatically. The exact room key, event envelope, replay cursor, revocation mechanism, and database-to-realtime publication pattern remain engineering design decisions to validate before implementation.

This decision approves architecture only. It does not authorize account creation, deployment, paid service activation, or implementation.
