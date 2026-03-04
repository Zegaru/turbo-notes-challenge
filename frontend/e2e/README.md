# E2E Tests

Playwright end-to-end tests for the notes app.

## Prerequisites

- **Backend** and **frontend** must be running before tests.
- Example: `docker compose up` from project root, or run backend and `pnpm dev` in frontend.

## Test User

- **Email:** `e2e-test@example.com`
- **Password:** `e2etestpass123`

No seed data is required. The auth setup creates this user via signup before running tests.

## Commands

```bash
# From frontend directory
pnpm test:e2e          # Run all E2E tests headless (default)
pnpm test:e2e:headed   # Run with browser visible
pnpm test:e2e:ui      # Run with Playwright UI
```

## Test Flows

1. **Login flow** (`login-flow.spec.ts`): Login → create category → create note → verify note appears.
2. **Pin note** (`app.spec.ts`): Pin a note and verify it appears at the top (pinned section).
3. **Upload image** (`app.spec.ts`): Upload image in note editor and verify thumbnail appears.
