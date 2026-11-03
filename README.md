# PopSage

PopSage is an Intercom-style customer-support training project with an embeddable live-chat widget, grounded AI answers, and explicit human handoff.

## Local development

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication setup

This slice uses Neon Managed Auth for identity and PopSage-owned Postgres tables for invitations and workspace membership.

1. Configure the branch-specific values in `.env.local`. `DATABASE_URL` must use a non-owner runtime login role without `BYPASSRLS`; reserve `DATABASE_URL_UNPOOLED` for migrations and operator commands. After migration, grant the runtime login membership in the migration-created `popsage_app` role.
2. In Neon Auth, require email verification, enable email/password, Google OAuth, and magic links, and register the exact local and deployed application origins. If Managed Auth cannot condition magic-link signup on a valid PopSage invitation, disable identity creation through magic links globally; invitees can create an identity with Google or a password and use magic links afterward. Retain only provider-supported verified-email account linking. Shared development email and shared Google credentials are for fictional testing only.
3. Apply the application schema with `npm run db:migrate`.
4. Create the first owner link with `npm run invite:owner -- owner@example.com`. The command prints the raw link once; the database stores only its token hash.

Neither migrations nor provider configuration run automatically. Live Neon changes, real email delivery, and deployment remain separately authorized operations.

Before considering a change complete, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Project documentation

- [Product requirements](./docs/prds/README.md)
- [Technology stack](./docs/architecture/tech-stack.md)
- [Design system](./DESIGN.md)
- [Architecture and workflow diagrams](./docs/architecture/diagrams.md)
- [Domain glossary](./GLOSSARY.md)
- [Architecture decisions](./docs/adr/)
- [Infrastructure research](./docs/research/infrastructure-options.md)

The local application scaffold is authorized. Cloud provisioning, paid plans, paid APIs, and billing activation still require explicit approval.
