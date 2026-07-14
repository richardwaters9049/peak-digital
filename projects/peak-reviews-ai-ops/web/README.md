# Peak Reviews AI Ops web application

This directory contains the Next.js 16 and React 19 operations console for Peak Reviews AI Ops. The interface consumes the Laravel API through a server-side Next.js proxy.

## Run the web application

Run the complete stack from the repository root, `/Users/your-name/Documents/GitHub/peak-digital`:

```bash
bash scripts/docker_peakDigital
```

The launcher builds the web application, API, and database, then prints and opens the selected local dashboard URL.

## Test the web application

Run this command from the repository root:

```bash
OPEN_BROWSER=0 bash scripts/docker_peakDigital test
```

The Docker build performs an optimised Next.js production build and TypeScript validation. The test command then runs ESLint inside the frontend container.

## Interface areas

- Executive dashboard and recovery queue.
- Review search, filtering, analysis, and reply drafting.
- Automation controls and a numbered, time-stamped run timeline.
- API endpoint reference, copyable `curl` request, and sample webhook ingestion.
- Fixed responsive sidebar with hover and close interactions.
- System preference detection for light and dark themes.
- Smooth page controls and Framer Motion page/component entrances.

## API proxy

Browser requests use `/backend/*`. The catch-all route at `src/app/backend/[...path]/route.ts` forwards them to the URL supplied through `API_URL`.

- Locally, `API_URL` is `http://api:8000` on the internal Docker network.
- On Render, `API_URL` points to the public Laravel service.

This arrangement prevents Docker-only service names from reaching browser DNS and keeps environment-specific API routing on the server.

## Main source files

- `src/app/page.tsx` contains the operations workspace, page state, API actions, themes, navigation, and motion components.
- `src/app/globals.css` contains global styling and browser defaults.
- `src/app/backend/[...path]/route.ts` contains the Laravel proxy.
- `next.config.ts` contains Next.js configuration.

## Production deployment

The repository-level `render.yaml` builds this directory as the `peak-reviews-ai-ops-web` Docker service. Render injects the production `API_URL`, waits for GitHub checks to pass, and verifies the `/` health check before marking the deployment successful.

The live interface is available at [peak-reviews-ai-ops-web.onrender.com](https://peak-reviews-ai-ops-web.onrender.com).

See the [application README](../README.md) for the full architecture, or return to the [workspace README](../../../README.md) for installation and launcher commands.
