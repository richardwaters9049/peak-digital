# Peak Reviews AI Ops

A reputation operations console that turns incoming customer reviews into structured insights, safe reply drafts, and auditable recovery workflows.

## Architecture

- **Laravel 13 API:** REST resources, webhook ingestion, request validation, automation orchestration, deterministic/OpenAI analysis, and audit records.
- **Next.js 16 dashboard:** executive metrics, review triage, reply drafting, workflow simulation, webhook lab, dark/light modes, and a self-contained fallback UI.
- **PostgreSQL 16:** businesses, locations, reviews, analyses, workflows, runs, users, jobs, sessions, and AI audit logs.
- **Docker Compose:** health-gated startup, persistent local data, loopback-only host bindings, automatic migrations, and idempotent demo seeding.

The browser talks only to Next.js. Next.js proxies `/backend/*` requests to Laravel over the internal Docker network, so the backend hostname is never exposed to browser DNS.

## Start

Run this from the workspace root:

```bash
bash scripts/docker_peakDigital
```

The printed URLs reflect any automatically selected ports. The app is fully usable without external credentials.

## AI reliability approach

`ReviewAnalysisService` requests JSON output when an OpenAI key is configured, normalises and bounds the returned fields, and falls back to deterministic business rules on missing credentials, network failure, provider errors, or invalid JSON. Every operation records its task, provider, model, prompt, response, estimated token usage, timestamp, and fallback state.

For a production evolution, model calls would move onto queues, webhook requests would use signature verification and idempotency keys, prompt/response retention would be governed by a data policy, and auto-publishing would remain human-approved until quality thresholds were proven.

## API surface

- `GET /api/dashboard/summary`
- `GET /api/reviews`
- `GET /api/reviews/{review}`
- `POST /api/reviews/{review}/analyse`
- `POST /api/reviews/{review}/reply-draft`
- `GET /api/automations`
- `POST /api/automations/{workflow}/run`
- `GET /api/webhooks/recent`
- `POST /api/webhooks/reviews/{source}`

## Demo-safe tradeoffs

- Authentication is a clearly labelled local session simulation; production would use Laravel Sanctum/OIDC with server-side authorization.
- Automation runs are synchronous so the complete flow is visible in the demo; production calls would be queued and retried.
- The seed dataset is fictional and idempotent.
- The Compose secrets are generated locally into ignored `.env` files and are not production credentials.
