# notes-challenge

Monorepo: Django + DRF backend, Next.js + TypeScript frontend.

## Setup

```bash
cp .env.example .env
docker compose up
```

## Environment Variables

| Variable            | Description                     |
| ------------------- | ------------------------------- |
| `DJANGO_SECRET_KEY` | Django secret key               |
| `POSTGRES_DB`       | PostgreSQL database name        |
| `POSTGRES_USER`     | PostgreSQL username             |
| `POSTGRES_PASSWORD` | PostgreSQL password             |
| `CORS_ORIGINS`      | Allowed CORS origins            |
| `DEBUG`             | Debug mode (true/false)         |
| `ALLOWED_HOSTS`     | Allowed hosts (comma-separated) |

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
