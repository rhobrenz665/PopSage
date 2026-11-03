# Use managed free-tier services for the training environment

Accepted on 3 November 2026 (Q17–Q19). Use Vercel Hobby for the Next.js application, widget assets, and HTTP APIs; Neon Free for Postgres/pgvector, managed owner/team authentication, and private object storage; and Trigger.dev Free for durable background jobs. Together with the separately approved Cloudflare realtime and AI choices, this keeps the personal training environment at a US$0 monthly target while exercising production-oriented service boundaries.

PopSage owns workspace authorization, tenant scope, conversation state, retention policy, and job outcomes. Authentication alone never grants workspace access. Postgres is authoritative for application and job state; Trigger.dev run state and logs are operational aids. Neon object paths do not grant authorization, and Vercel does not become the transcript store or workflow authority. Provider endpoints, regions, credentials, and limits remain server-side configuration behind narrow boundaries.

Free-tier exhaustion must produce a visible, recoverable unavailable or queued state and must never enable a paid plan, overage, trial requiring billing, or automatic provider fallback. Product maximums are not promises that every workspace can fill them simultaneously within free quotas. Record measured consumption and upgrade only a demonstrated bottleneck after explicit approval.

This decision approves architecture only. It does not authorize account creation, deployment, API use, implementation, or paid activation. Reassess plan eligibility, regions, quotas, retention, and data handling before real business data or commercial use.
