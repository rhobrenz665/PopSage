# PopSage

PopSage is an Intercom-style customer-support training project with an embeddable live-chat widget, grounded AI answers, and explicit human handoff.

## Local development

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Before considering a change complete, run:

```bash
npm run lint
npm run typecheck
npm run build
```

## Project documentation

- [Product requirements](./docs/prds/README.md)
- [Technology stack](./docs/architecture/tech-stack.md)
- [Architecture and workflow diagrams](./docs/architecture/diagrams.md)
- [Domain glossary](./GLOSSARY.md)
- [Architecture decisions](./docs/adr/)
- [Infrastructure research](./docs/research/infrastructure-options.md)

The local application scaffold is authorized. Cloud provisioning, paid plans, paid APIs, and billing activation still require explicit approval.
