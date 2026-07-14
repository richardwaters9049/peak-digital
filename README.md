# Reputrail

[![CI](https://github.com/richardwaters9049/peak-digital/actions/workflows/ci.yml/badge.svg)](https://github.com/richardwaters9049/peak-digital/actions/workflows/ci.yml)

<img src="projects/peak-reviews-ai-ops/web/public/reputrail-mark.svg" alt="Reputrail logo" width="72">

**Every review. A clear route forward.**

Reputrail is a full-stack reputation operations console. It combines a Laravel API, Next.js dashboard, PostgreSQL, AI-assisted review analysis, automation workflows, webhook ingestion, and an auditable fallback path.

## Live application

- [Open Reputrail](https://peak-reviews-ai-ops-web.onrender.com)
- [Check the Laravel API health endpoint](https://peak-reviews-ai-ops-api.onrender.com/up)

The Render services use the free plan and may take a short time to wake after a period of inactivity.

## Application documentation

The complete architecture, API surface, reliability approach, and production trade-offs are covered in the [Reputrail application README](projects/peak-reviews-ai-ops/README.md).

Component-specific guides are also available for the [Laravel API](projects/peak-reviews-ai-ops/api/README.md) and [Next.js web application](projects/peak-reviews-ai-ops/web/README.md).

## Run locally with one command

### 1. Clone the repository

Run these commands from the directory where you keep GitHub projects, for example `/Users/your-name/Documents/GitHub`:

```bash
git clone https://github.com/richardwaters9049/peak-digital.git
cd peak-digital
```

### 2. Start the complete application

Run this command from the repository root, `peak-digital`:

```bash
bash scripts/docker_reputrail
```

The launcher detects the operating system and CPU architecture, selects free local ports, generates development-only secrets, builds every service, starts PostgreSQL, runs migrations and idempotent demo seeding, waits for health checks, and opens the dashboard when the platform supports it.

The terminal prints the selected dashboard and API URLs. No manual dependency installation is required.

## Platform requirements

| Platform | Docker runtime | Shell |
| --- | --- | --- |
| macOS, Intel or Apple silicon | Docker Desktop | Bash included with macOS |
| Linux | Docker Engine with the Compose plug-in | Bash |
| Windows with WSL | Docker Desktop with WSL integration | Bash in WSL |
| Windows | Docker Desktop | Git Bash |

Docker must be running before the launcher starts. Set `OPEN_BROWSER=0` in headless or remote environments to prevent automatic browser opening:

```bash
OPEN_BROWSER=0 bash scripts/docker_reputrail
```

## Application controls

Run every command below from the repository root, `peak-digital`:

```bash
bash scripts/docker_reputrail start
bash scripts/docker_reputrail stop
bash scripts/docker_reputrail restart
bash scripts/docker_reputrail status
bash scripts/docker_reputrail logs
bash scripts/docker_reputrail test
bash scripts/docker_reputrail reset
```

- `start` builds and opens the application while preserving the existing database.
- `stop` closes the application containers while preserving local data.
- `restart` stops and then starts the application.
- `status` shows container health and the selected local URLs.
- `logs` follows the API and frontend container output.
- `test` builds the application, runs the Laravel test suite, and runs frontend linting.
- `reset` removes the local PostgreSQL volume and rebuilds the curated demo dataset.

## Optional OpenAI integration

The application is fully usable without an OpenAI API key. When no key is supplied, it uses deterministic business rules and records the fallback in its AI audit trail.

To use OpenAI for a local launch, run this command from the repository root:

```bash
OPENAI_API_KEY=your-key bash scripts/docker_reputrail
```

Never commit an API key or generated environment file.

## Current product features

- Executive dashboard with operational metrics, rating distribution, trends, and recovery queue.
- Review triage, AI analysis, safe reply drafting, and provider/fallback audit details.
- Automation workflows with numbered, time-stamped run history.
- Webhook and API laboratory with sample ingestion and copy-to-clipboard support.
- Responsive fixed sidebar, smooth page controls, system-aware light and dark themes, and Framer Motion transitions.
- Next.js server-side proxying so internal Docker hostnames are not exposed to the browser.

## Architecture

```text
Browser
  └── Next.js 16 web application
        └── /backend/* proxy
              └── Laravel 13 API
                    ├── PostgreSQL 16
                    └── OpenAI or deterministic fallback
```

Local services run through Docker Compose and bind only to the loopback interface.

## Repository layout

```text
.
├── .github/workflows/ci.yml             # GitHub Actions build and test workflow
├── render.yaml                           # Render web, API, and database blueprint
├── scripts/docker_reputrail              # Cross-platform application launcher
└── projects/peak-reviews-ai-ops
    ├── api/                              # Laravel API, AI services, data, and tests
    ├── web/                              # Next.js operations dashboard
    ├── docker-compose.yml                # PostgreSQL, API, and frontend services
    └── README.md                         # Full application documentation
```

## CI/CD

GitHub Actions runs for pull requests and pushes to `main`. It validates the launcher, builds the Docker services, runs the Laravel tests, runs frontend linting, and cleans up the test containers.

Render is configured through `render.yaml` with `checksPass` deployment gates. A successful `main` build deploys the affected services, which must then pass their configured health checks before the release is marked successful.
