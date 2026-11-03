# Bootstrap anonymous visitor sessions through the host page

Accepted on 3 November 2026 (Q24). The PopSage host-page loader stores an opaque visitor-session handle in the embedding site's first-party browser storage and passes short-lived access credentials to the iframe through a constrained bootstrap channel. Do not depend on third-party iframe cookies or storage for continuity across the supported browser matrix.

The handle and resulting credentials are scoped to the visitor, workspace, and exact allowed origin. The public installation identifier is not authorization. The iframe must verify message source/origin and must not accept arbitrary credentials or configuration from unrelated windows. Secrets and durable provider credentials never enter the loader or iframe. Clearing site data creates a new anonymous identity; cross-origin, cross-browser, and cross-device continuity are deliberately unsupported.

Allowed widget origins use exact normalized `scheme + hostname + port` matching. Require HTTPS except HTTP localhost during development; do not support wildcards. Origin configuration rejects credentials, paths, query strings, fragments, deceptive subdomains, and Unicode lookalikes rather than trying to interpret them permissively.

Iframe access credentials expire after 15 minutes and are refreshed while an authorized widget remains active. The rotating first-party visitor-session handle expires after 90 days of inactivity. Generate the handle with cryptographically secure high entropy, persist only a server-side hash, rotate it after successful exchange, and reject replay of a replaced value. Invalid, expired, or replayed handles create a fresh anonymous session without exposing the previous transcript.

Iframe access uses a signed token that references the visitor session without containing transcript content or provider secrets. Vercel signs it with Ed25519; PartyServer and protected APIs verify it with public keys. Include a key identifier and support overlapping public keys during controlled rotation. Keep private signing material only in the issuing service. Every protected API request and realtime connection checks current session/workspace/origin state rather than trusting signature validity alone. Removing an allowed origin immediately revokes that origin's visitor credentials and realtime connections; re-adding it does not revive revoked credentials.

PopSage must support rotation, revocation, replay resistance, and a clean new-session path without exposing another visitor's transcript. A compromised host page can act as that origin's anonymous visitor, so the session grants only visitor-scoped conversation access and no business/team privileges. Exact token claims, key storage, rotation overlap, and emergency rotation remain engineering design decisions.

This ADR records planning only and does not authorize implementation or deployment.
