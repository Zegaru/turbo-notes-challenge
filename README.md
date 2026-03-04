# notes-challenge

Monorepo: Django + DRF backend, Next.js + TypeScript frontend.

## Setup

```bash
cp .env.example .env
docker compose up
```

Migrations run automatically on backend startup. For local development without Docker, run `cd backend && uv run python manage.py migrate` after starting PostgreSQL.

## Environment Variables

### Backend

| Variable             | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection URL (default: `postgres://notes:notes@db:5432/notes`) |
| `DJANGO_SECRET_KEY`  | Django secret key                                                           |
| `POSTGRES_DB`        | PostgreSQL database name                                                    |
| `POSTGRES_USER`      | PostgreSQL username                                                         |
| `POSTGRES_PASSWORD`  | PostgreSQL password                                                         |
| `CORS_ORIGINS`       | Allowed CORS origins                                                        |
| `DEBUG`              | Debug mode (true/false)                                                     |
| `ALLOWED_HOSTS`      | Allowed hosts (comma-separated)                                             |
| `AI_PROVIDER`        | `mock` or `openai` (default: `mock`)                                        |
| `OPENAI_API_KEY`     | OpenAI API key (required for `openai` provider)                             |
| `OPENAI_MODEL`       | OpenAI model (default: `gpt-5-mini`)                                        |
| `AI_REQUEST_TIMEOUT` | Timeout in seconds for AI requests (default: `10`)                          |

### Frontend

| Variable                   | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (default: `http://localhost:8000`) |

## API

Interactive API docs: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/) (Swagger). Schema: `/api/schema/`.

### Authentication

The app uses JWT (SimpleJWT) for auth. Users can sign up or log in; tokens are stored in `localStorage`. The frontend refreshes the access token automatically before expiry and on 401 responses.

| Endpoint              | Method | Description                      |
| --------------------- | ------ | -------------------------------- |
| `/api/signup/`        | POST   | Create account (email, password) |
| `/api/token/`         | POST   | Login (username=email, password) |
| `/api/token/refresh/` | POST   | Refresh access token             |

Protected routes (`/app/*`) redirect to `/login` when unauthenticated. Auth routes (`/login`, `/signup`) redirect to `/app` when authenticated.

### Notes & Categories

All endpoints require authentication (Bearer token).

| Endpoint                       | Method                  | Description                                             |
| ------------------------------ | ----------------------- | ------------------------------------------------------- |
| `/api/categories/`             | GET                     | List categories                                         |
| `/api/categories/`             | POST                    | Create category                                         |
| `/api/categories/<id>/`        | GET, PUT, PATCH, DELETE | Retrieve, update, delete category                       |
| `/api/notes/`                  | GET                     | List notes (filters: `category_id`, `pinned`, `q`)      |
| `/api/notes/`                  | POST                    | Create note                                             |
| `/api/notes/<id>/`             | GET, PUT, PATCH, DELETE | Retrieve, update, delete note                           |
| `/api/notes/suggest-category/` | POST                    | AI-suggest category for note (body: `title`, `content`) |

## Scripts

| Command                                           | Description          |
| ------------------------------------------------- | -------------------- |
| `docker compose up`                               | Start all services   |
| `cd backend && uv run python manage.py migrate`   | Run migrations       |
| `cd backend && uv run python manage.py runserver` | Run backend locally  |
| `cd frontend && pnpm dev`                         | Run frontend locally |
| `cd backend && uv run pytest`                     | Run backend tests    |
| `cd frontend && pnpm test`                        | Run frontend tests   |

## Pre-commit

```bash
pip install pre-commit   # or: uv tool install pre-commit
pre-commit install
pre-commit install --hook-type pre-push
```

Pre-commit runs ruff + black + ESLint on staged files. Pre-push runs pytest + typecheck.
