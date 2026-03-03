# notes-challenge

Monorepo: Django + DRF backend, Next.js + TypeScript frontend.

## Setup

```bash
cp .env.example .env
docker compose up
```

## Environment Variables

### Backend

| Variable            | Description                     |
| ------------------- | ------------------------------- |
| `DJANGO_SECRET_KEY` | Django secret key               |
| `POSTGRES_DB`       | PostgreSQL database name        |
| `POSTGRES_USER`     | PostgreSQL username             |
| `POSTGRES_PASSWORD` | PostgreSQL password             |
| `CORS_ORIGINS`      | Allowed CORS origins            |
| `DEBUG`             | Debug mode (true/false)         |
| `ALLOWED_HOSTS`     | Allowed hosts (comma-separated) |

### Frontend

| Variable                   | Description                          |
| -------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (default: `http://localhost:8000`) |

## Authentication

The app uses JWT (SimpleJWT) for auth. Users can sign up or log in; tokens are stored in `localStorage`. The frontend refreshes the access token automatically before expiry and on 401 responses.

| Endpoint              | Method | Description                          |
| --------------------- | ------ | ------------------------------------ |
| `/api/signup/`        | POST   | Create account (email, password)     |
| `/api/token/`         | POST   | Login (username=email, password)     |
| `/api/token/refresh/` | POST   | Refresh access token                 |

Protected routes (`/app/*`) redirect to `/login` when unauthenticated. Auth routes (`/login`, `/signup`) redirect to `/app` when authenticated.

## Scripts

| Command                                    | Description          |
| ------------------------------------------ | -------------------- |
| `docker compose up`                        | Start all services   |
| `cd backend && python manage.py runserver` | Run backend locally  |
| `cd frontend && pnpm dev`                  | Run frontend locally |

## Pre-commit

```bash
pip install pre-commit   # or: uv tool install pre-commit
pre-commit install
pre-commit install --hook-type pre-push
```

Pre-commit runs ruff + black + ESLint on staged files. Pre-push runs pytest + typecheck.
