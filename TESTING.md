# Testing

## Unit Tests (Vitest)

```bash
cd frontend && pnpm test
```

## E2E Tests (Playwright)

**Prerequisites:** Backend and frontend must be running (e.g. `docker compose up` or `pnpm dev` + backend).

```bash
cd frontend && pnpm test:e2e
```

See [frontend/e2e/README.md](frontend/e2e/README.md) for details.
