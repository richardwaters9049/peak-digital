# Reputrail

<img src="web/public/reputrail-mark.svg" alt="Reputrail logo" width="72">

**Every review. A clear route forward.**

Reputrail is a reputation operations console that turns incoming customer reviews into structured insight, safe reply drafts, recovery actions, and auditable automation runs.

## Live services

- [Web application](https://peak-reviews-ai-ops-web.onrender.com)
- [Laravel API health endpoint](https://peak-reviews-ai-ops-api.onrender.com/up)

Render free-plan services may take a short time to wake after inactivity.

## Architecture

- **Laravel 13 API:** REST resources, webhook ingestion, request validation, automation orchestration, deterministic or OpenAI analysis, and AI audit records.
- **Next.js 16 and React 19:** executive metrics, review triage, reply drafting, workflow simulation, webhook tools, responsive navigation, system-aware themes, and Framer Motion transitions.
- **PostgreSQL 16:** businesses, locations, reviews, analyses, workflows, runs, users, jobs, sessions, and AI audit logs.
- **Docker Compose:** health-gated startup, persistent local data, loopback-only host bindings, automatic migrations, and idempotent demo seeding.

The browser communicates only with Next.js. Next.js proxies `/backend/*` requests to Laravel, using the internal Docker hostname locally and the Render API URL in production. Internal service names are therefore never exposed to browser DNS.

## Start the application

Run this command from the repository root, `/Users/your-name/Documents/GitHub/peak-digital`:

```bash
bash scripts/docker_reputrail
```

The launcher prints the automatically selected dashboard and API ports. The application does not require external credentials.

For all launcher commands, platform requirements, cloning instructions, and OpenAI configuration, see the [workspace README](../../README.md).

## Test the application

Run this command from the repository root:

```bash
OPEN_BROWSER=0 bash scripts/docker_reputrail test
```

The test command builds the production frontend, runs TypeScript validation as part of the Next.js build, executes the Laravel test suite, and runs ESLint.

## Product areas

- **Dashboard:** operational metrics, rating distribution, AI coverage, topic trends, recent audit records, and a recovery queue.
- **Reviews:** searchable review triage, sentiment and theme analysis, urgency, suggested actions, and reply drafting.
- **Automations:** workflow simulation with numbered run history, timestamps, event counts, review context, and completion status.
- **API:** documented endpoints, a copyable `curl` example, and sample webhook ingestion.
- **Workspace experience:** a responsive fixed sidebar, page reset on navigation, smooth scroll controls, theme preference detection, and staggered component entrances.

## AI reliability approach

`ReviewAnalysisService` requests structured JSON when an OpenAI key is configured. It normalises and bounds the returned fields, then falls back to deterministic business rules when credentials are absent or when a network, provider, or response-validation failure occurs.

Every analysis records its task, provider, model, prompt, response, estimated token usage, timestamp, and fallback state. This makes provider behaviour visible rather than silently hiding degraded operation.

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

See the [Laravel API README](api/README.md) for backend details and the [Next.js web README](web/README.md) for the interface and proxy architecture.

## Local data and secrets

The launcher creates an ignored `.env` file beside `docker-compose.yml`. It contains local ports and generated development secrets. PostgreSQL data is stored in the named Docker volume `peak-reviews-ai-ops_postgres-data` and survives normal stop/start cycles.

Use `bash scripts/docker_reputrail reset` from the repository root only when you intend to delete the local database and reseed it.

## CI/CD and Render

The repository-level GitHub Actions workflow validates the launcher and runs the complete Docker test command on pull requests and pushes to `main`.

The repository-level `render.yaml` blueprint defines:

- `peak-reviews-ai-ops-web`, the Next.js web service;
- `peak-reviews-ai-ops-api`, the Laravel API service; and
- `peak-reviews-ai-ops-db`, the managed PostgreSQL database.

Both web services deploy only after GitHub checks pass and must satisfy their Render health checks.

## Deliberate demo trade-offs

- Authentication is a clearly labelled local session simulation; a production version would use Laravel Sanctum or OIDC with server-side authorisation.
- Automation runs are synchronous so the complete flow remains visible; production work would use queues, retries, and dead-letter handling.
- The seed dataset is fictional and idempotent.
- Local Compose secrets are generated into ignored environment files and are not production credentials.
- Production model calls would use queues, webhook signatures, idempotency keys, a formal data-retention policy, and human approval until publishing quality thresholds were proven.
