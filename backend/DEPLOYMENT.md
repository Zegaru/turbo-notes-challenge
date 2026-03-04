# Backend Deployment (Coolify)

## Required Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DJANGO_SECRET_KEY` | Yes | Secret key for Django (use a strong random value) | `your-50-char-secret` |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password | `secure-password` |
| `POSTGRES_USER` | No | PostgreSQL user (default: `notes`) | `notes` |
| `POSTGRES_DB` | No | PostgreSQL database (default: `notes`) | `notes` |
| `DATABASE_URL` | No* | Full DB URL (auto-built from POSTGRES_* in compose) | `postgres://user:pass@db:5432/notes` |
| `ALLOWED_HOSTS` | Yes | Comma-separated hostnames Django will serve | `api.example.com,your-domain.com` |
| `CORS_ORIGINS` | Yes | Comma-separated frontend origins for CORS | `https://app.example.com` |
| `DEBUG` | No | Set to `false` in production | `false` |
| `PORT` | No | Port for gunicorn (Coolify sets this) | `8000` |
| `MEDIA_ROOT` | No | Persistent path for uploaded files (default: `/data/media` in prod) | `/data/media` |
| `STATIC_ROOT` | No | Path for collectstatic output (default: `/app/staticfiles`) | `/app/staticfiles` |

\* `DATABASE_URL` is set automatically in docker-compose.prod.yml from `POSTGRES_*` vars.

## Coolify Setup

1. Create a new application from the repository.
2. Use `docker-compose.prod.yml` as the compose file (or set compose path in Coolify).
3. Set the environment variables above in Coolify's env configuration.
4. Ensure `ALLOWED_HOSTS` includes your API domain and `CORS_ORIGINS` includes your frontend URL.
5. The `/health` endpoint is used for health checks; Coolify can probe it.

## Endpoints

- `GET /health` — Health check (returns 200)
- `GET /api/health/` — API health (returns `{"status":"ok"}`)
- `GET /api/docs/` — Swagger UI
