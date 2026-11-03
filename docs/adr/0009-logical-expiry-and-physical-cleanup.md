# Separate logical expiry from physical cleanup

Accepted on 3 November 2026 (Q29), building on the approved conversation lifecycle. When a transcript or visitor session reaches its expiry, PopSage immediately denies application access and excludes it from ordinary application use. A retryable Trigger.dev cleanup job removes expired records and associated primary-storage data within 24 hours.

Logical expiry is authoritative even while cleanup is pending. Cleanup must be idempotent, workspace-scoped, observable without copying transcript contents into logs, and safe to retry within the 24-hour deletion window. Missing the deadline creates a metadata-only operator alert containing record type, workspace ID, cleanup job ID, deadline, and failure category—never transcript or document content. Failure keeps the material inaccessible and raises an operational error; it never restores access or extends retention. Related database records, vectors, source links, realtime state, and storage objects must follow their applicable lifecycle without crossing workspace boundaries.

In training, missed-cleanup alerts appear in an operator-only dashboard and structured metadata logs. Deduplicate repeated failures for the same cleanup obligation and keep the alert open until cleanup succeeds or an operator records a resolution. External paging/email is deferred until planning a real pilot.

Provider-managed backups, restore history, logs, and replicas may follow separate provider retention schedules. For fictional training data, accept those documented provider schedules when they cannot be configured at the free tier, and do not describe application cleanup as immediate erasure from every provider copy. Prohibit real business/customer data until retention, deletion, restoration, and operator-access behavior is reviewed and accepted for every provider.

This ADR records planning only. It does not authorize implementation, provisioning, or claims of verified deletion behavior.
