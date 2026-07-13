# Peak Digital AI operations platform

This workspace contains **Peak Reviews AI Ops**, a full-stack AI operations console built to demonstrate Laravel depth, practical LLM integration, automation workflows, webhook design, auditability, and end-to-end product delivery.

## One-command demo

From this directory, run:

```bash
scripts/docker_peakDigital
```

The launcher selects free local ports, generates development-only secrets, builds the Laravel API and Next.js dashboard, starts PostgreSQL, runs migrations and idempotent demo seeding, waits for health checks, and opens the app in your browser where the platform supports it.

The operating system and CPU architecture are detected before startup. The launcher supports macOS (Intel and Apple silicon), Linux, Windows Subsystem for Linux, and Windows through Git Bash. It uses the available Docker Compose interface, selects a compatible port-detection method, provides platform-specific Docker guidance, and opens the dashboard with the native browser command where available.

### Platform requirements

| Platform | Docker runtime | Shell |
| --- | --- | --- |
| macOS | Docker Desktop | Bash included with macOS |
| Linux | Docker Engine with Compose plugin | Bash |
| Windows with WSL | Docker Desktop with WSL integration | Bash in WSL |
| Windows | Docker Desktop | Git Bash |

Set `OPEN_BROWSER=0` in headless or remote environments to prevent automatic browser opening.

No OpenAI key is required. Without one, the app uses its deterministic AI fallback and records that choice in the audit trail. To use OpenAI for the first launch:

```bash
OPENAI_API_KEY=your-key bash scripts/docker_peakDigital
```

## Useful controls

```bash
scripts/docker_peakDigital start
scripts/docker_peakDigital stop
scripts/docker_peakDigital restart
scripts/docker_peakDigital status
scripts/docker_peakDigital logs
scripts/docker_peakDigital test
scripts/docker_peakDigital reset
```

`stop` closes the application containers while preserving the local database. `start` reopens the existing application, and `restart` performs both operations in sequence.

`reset` deletes the local demo database volume and rebuilds the curated dataset.

## Workspace layout

```text
.
├── scripts/docker_peakDigital
└── projects/peak-reviews-ai-ops
    ├── api/                 # Laravel API, AI service, webhooks, automations, tests
    ├── web/                 # Next.js operations dashboard
    └── docker-compose.yml   # PostgreSQL + API + frontend
```

## Product demo path

1. Start on the executive dashboard and explain the API-backed metrics and topic trends.
2. Open **Reviews**, choose a low-rating review, and rerun analysis.
3. Show the reply draft plus the provider/fallback marker in the AI audit trail.
4. Run **Negative Review Rescue** in the automation lab.
5. Use **API** to ingest a sample webhook and show the review enter the workflow.

The architecture and talking points are documented in [the project README](projects/peak-reviews-ai-ops/README.md).
