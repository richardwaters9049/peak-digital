# Peak Reviews AI Ops API

This directory contains the Laravel 13 API for Peak Reviews AI Ops. It owns review ingestion, analysis, reply drafting, operational summaries, automation execution, persistence, and AI audit records.

## Run the API as part of the application

Run this command from the repository root, `/Users/your-name/Documents/GitHub/peak-digital`:

```bash
bash scripts/docker_peakDigital
```

Docker Compose starts the API with PostgreSQL and the Next.js frontend. The launcher prints the selected local API URL after its health check passes.

## Test the API

Run the complete project test command from the repository root:

```bash
OPEN_BROWSER=0 bash scripts/docker_peakDigital test
```

The Laravel suite uses an in-memory SQLite database during automated tests. It covers deterministic AI analysis, webhook ingestion, dashboard metrics, reply drafting, and automation execution.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/dashboard/summary` | Returns operational metrics, trends, rating distribution, and audit data |
| `GET` | `/api/reviews` | Lists reviews and their analysis state |
| `GET` | `/api/reviews/{review}` | Returns one review |
| `POST` | `/api/reviews/{review}/analyse` | Runs OpenAI or deterministic analysis |
| `POST` | `/api/reviews/{review}/reply-draft` | Produces a proposed customer reply |
| `GET` | `/api/automations` | Lists configured workflows and recent runs |
| `POST` | `/api/automations/{workflow}/run` | Executes a workflow simulation |
| `GET` | `/api/webhooks/recent` | Returns recently ingested webhook reviews |
| `POST` | `/api/webhooks/reviews/{source}` | Validates and ingests a third-party review |
| `GET` | `/up` | Provides the production health check |

## AI analysis

`app/Services/ReviewAnalysisService.php` provides the model boundary. When `OPENAI_API_KEY` is available, it requests structured output from the configured model. It validates and normalises the result before persistence.

When credentials are absent or the provider response cannot be trusted, the service applies deterministic rules. The result records the provider, model, estimated token usage, raw response, timestamp, and whether fallback logic was used.

## Data lifecycle

Database migrations define businesses, locations, reviews, analyses, automation workflows, automation runs, users, cache records, jobs, and sessions. `DemoSeeder` provides fictional, repeatable data for local demonstrations.

The local PostgreSQL volume survives normal stop and restart commands. Run `bash scripts/docker_peakDigital reset` from the repository root only when the data should be deleted and reseeded.

## Configuration

Docker Compose supplies local configuration at runtime. The principal variables are:

- `APP_KEY`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`
- `OPENAI_API_KEY`, which is optional
- `OPENAI_MODEL`, which defaults locally to `gpt-4o-mini`
- `OPENAI_TIMEOUT`

Never commit real keys or generated environment files.

## Production deployment

The repository-level `render.yaml` builds this directory as the `peak-reviews-ai-ops-api` Docker service. Render supplies the managed PostgreSQL connection, production application key, and service URL. Deployment waits for GitHub checks and the `/up` health check.

See the [application README](../README.md) for architecture and trade-offs, or return to the [workspace README](../../../README.md) for installation and launcher commands.

## Licence

Laravel is open-source software licensed under the [MIT licence](https://opensource.org/licenses/MIT).
