# Restrict the v1 knowledge base to visitor-safe information

Accepted on 3 November 2026 during the founder’s design interview. Every uploaded knowledge document must be suitable for disclosure to any website visitor; internal staff documents and audience-specific knowledge permissions are outside v1. This favors a simple, auditable disclosure boundary over mixed internal/external knowledge: workspace isolation separates businesses but cannot make confidential information safe to reveal to anonymous visitors within the same workspace.

Owners must confirm that their documents meet this boundary before uploading. Account-specific requests go to humans; the AI does not look up customer accounts or perform business actions. Supporting private knowledge later requires an explicit audience and identity model, not merely a retrieval filter added to this assumption.
