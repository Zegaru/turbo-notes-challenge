# Notes Taking App

Monorepo: **Django + DRF backend, Next.js + TypeScript frontend.**

A modern note-taking application designed to capture and organize thoughts efficiently.
The app supports markdown editing, image attachments, pinned notes, categories, and AI-assisted organization.

---

# Features

- Create, edit, and organize notes
- Markdown editing with preview and split view
- Attach images to notes
- Pin important notes
- Search notes by text
- Organize notes with categories
- AI-powered category suggestions
- Responsive UI for desktop and mobile

To extend the base challenge requirements, I added a few lightweight productivity features inspired by modern note-taking tools:

- **Smart category suggestions** to help organize notes faster
- **Markdown support with live preview** for structured writing
- **Image support in notes**
- **Pinned notes** for prioritizing important information

---

# Architecture

The project is structured as a small monorepo containing a backend API and a frontend application.

```
                ┌──────────────────────────┐
                │        Next.js App       │
                │  React + TypeScript UI  │
                │                          │
                │  - Notes UI              │
User Browser ───►  - Markdown editor      │
                │  - Image uploads        │
                │  - AI category request  │
                └─────────────┬────────────┘
                              │ HTTP (REST)
                              ▼
                ┌──────────────────────────┐
                │       Django API         │
                │   Django + DRF + JWT     │
                │                          │
                │  - Authentication        │
                │  - Notes CRUD            │
                │  - Categories CRUD       │
                │  - Image upload          │
                │  - AI category service   │
                └─────────────┬────────────┘
                              │
                              ▼
                ┌──────────────────────────┐
                │        PostgreSQL        │
                │                          │
                │  Users                   │
                │  Notes                   │
                │  Categories              │
                │  NoteImages              │
                └──────────────────────────┘
```

---

# Setup

```bash
cp .env.example .env
docker compose up
```

Migrations run automatically on backend startup. For local development without Docker, run:

```bash
cd backend && uv run python manage.py migrate
```

after starting PostgreSQL.

---

# Environment Variables

## Backend

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

## Frontend

| Variable                   | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (default: `http://localhost:8000`) |

---

# API

Interactive API docs:
[http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)

Schema: `/api/schema/`

---

## Authentication

The app uses **JWT authentication (SimpleJWT)**.

Users can sign up or log in; tokens are stored in `localStorage`.
The frontend refreshes the access token automatically before expiry and on 401 responses.

| Endpoint              | Method | Description                      |
| --------------------- | ------ | -------------------------------- |
| `/api/signup/`        | POST   | Create account (email, password) |
| `/api/token/`         | POST   | Login (username=email, password) |
| `/api/token/refresh/` | POST   | Refresh access token             |

Protected routes (`/app/*`) redirect to `/login` when unauthenticated.
Auth routes (`/login`, `/signup`) redirect to `/app` when authenticated.

---

## Notes & Categories

All endpoints require authentication (Bearer token).

| Endpoint                       | Method                  | Description                                        |
| ------------------------------ | ----------------------- | -------------------------------------------------- |
| `/api/categories/`             | GET                     | List categories                                    |
| `/api/categories/`             | POST                    | Create category                                    |
| `/api/categories/<id>/`        | GET, PUT, PATCH, DELETE | Retrieve, update, delete category                  |
| `/api/notes/`                  | GET                     | List notes (filters: `category_id`, `pinned`, `q`) |
| `/api/notes/`                  | POST                    | Create note                                        |
| `/api/notes/<id>/`             | GET, PUT, PATCH, DELETE | Retrieve, update, delete note                      |
| `/api/notes/suggest-category/` | POST                    | AI-suggest category for note (`title`, `content`)  |

---

# Scripts

| Command                                           | Description          |
| ------------------------------------------------- | -------------------- |
| `docker compose up`                               | Start all services   |
| `cd backend && uv run python manage.py migrate`   | Run migrations       |
| `cd backend && uv run python manage.py runserver` | Run backend locally  |
| `cd frontend && pnpm dev`                         | Run frontend locally |
| `cd backend && uv run pytest`                     | Run backend tests    |
| `cd frontend && pnpm test`                        | Run frontend tests   |

---

# Development Process

To approach the challenge efficiently within the time constraint, I followed a structured workflow focused on quickly establishing a reliable technical foundation and then iterating on features and polish.

After reviewing the requirements and the provided Figma design, I identified the core functional areas:

- Authentication
- Notes management
- Categories
- Media support
- Search and filtering

Before implementing features, I defined the architecture and technology stack to avoid revisiting structural decisions later.

Once the stack was defined, I created:

- Project monorepo structure
- Backend service
- Frontend application
- Docker configuration for backend and PostgreSQL
- Pre-commit hooks and GitHub Actions to maintain code quality

From there, development proceeded iteratively:

1. Authentication
2. Core data models and API
3. Notes UI and editor
4. Image support and markdown preview
5. AI category suggestions
6. UI polish and responsive layout

---

# Key Design and Technical Decisions

## Data model

The backend API revolves around three main models:

- **Category**
- **Note**
- **NoteImage**

Each note belongs to a user and can optionally belong to a category.
Images are stored separately and linked to notes, allowing multiple images per note while keeping the data model simple.

## Application structure

The frontend is designed around a **single main application view**, with UI state controlled by URL query parameters:

- `note` → opens a note in a modal
- `category` → filters notes by category
- `search` → filters notes by text

This allows deep linking and keeps navigation simple.

## Autosave editor

Instead of requiring manual saves, the editor automatically saves changes after a short debounce when the user stops typing. This creates a smoother editing experience.

## Image handling

Images are uploaded via a dedicated endpoint and stored separately from note content.
This simplifies the note data model while allowing flexible image management.

## Responsive design

The layout adapts from a desktop notes grid to a mobile-friendly list view.
A bottom navigation bar improves usability on smaller screens.

---

# AI Integration

AI is used specifically for **category suggestions**.

Instead of automating the writing process, the goal was to support a small but useful organizational task.

The design principles for AI usage were:

- **Optional** – users explicitly request suggestions
- **Non-disruptive** – AI never interrupts the writing flow
- **Assistive** – it helps organize notes rather than generate content

When triggered, the backend sends the note title and content along with available categories to the AI service, which returns the most relevant category suggestion.

The AI provider can be switched between:

- `mock` (default for local development)
- `openai` (real AI suggestions)

---

# AI Tools Used During Development

AI tools were used to accelerate development while maintaining manual control over architecture and code quality.

### Cursor

Cursor was used as the primary development environment.

It assisted with:

- scaffolding backend and frontend code
- generating serializers and API routes
- generating React components
- refactoring repetitive logic
- writing tests
- generating Docker and CI configurations

All generated code was reviewed and refined manually.

### Architecture and planning

AI was also used during early project planning to:

- outline the stack
- design API endpoints
- propose the initial data model

This reduced iteration time and helped focus development on feature implementation.

### UI implementation

During frontend development, AI assisted with translating Figma designs into Tailwind components while maintaining consistency with the extracted design tokens.

---

# Tradeoffs

Due to the time constraint of the challenge:

- Image storage uses local media rather than cloud storage.
- AI suggestions focus only on category classification.
- The editor uses markdown rather than a full rich text editor.

These choices keep the system simple while still demonstrating the required functionality.

---

# Pre-commit

```bash
pip install pre-commit
pre-commit install
pre-commit install --hook-type pre-push
```

Pre-commit runs:

- ruff
- black
- ESLint

Pre-push runs:

- pytest
- type checking

---

# Deployment

The application is deployed using a split frontend/backend architecture.

## Live Demo

| Link | URL |
| ---- | --- |
| Frontend | https://notes.zegaru.com |
| API Docs | https://api.notes.zegaru.com/api/docs/ |

---

## Frontend

The frontend is deployed on **Netlify**.

Build settings:

```
Base directory: frontend
Build command: pnpm build
Publish directory: out
```

Environment variables:

```
NEXT_PUBLIC_API_BASE_URL=https://api.notes.zegaru.com
```

---

## Backend

The backend is deployed on a **VPS using Coolify** with Docker Compose.

Service architecture:

```
Internet
   ↓
Coolify / Traefik (HTTPS)
   ↓
Django + Gunicorn container (port 8000)
   ↓
PostgreSQL container
```

Domain:

```
https://api.notes.zegaru.com
```

The backend runs using:

```
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

Database and media storage are persisted using Docker volumes.

---

## DNS

**Frontend (Netlify):**

```
notes.zegaru.com   → CNAME → notes-turbo.netlify.app
www.notes.zegaru.com → CNAME → notes-turbo.netlify.app
```

**Backend (Coolify):**

```
api.notes.zegaru.com → A record → VPS public IP
```

HTTPS certificates are automatically managed by Netlify (frontend) and Coolify (backend) using Let's Encrypt.

---

## API Docs

Once deployed, the API documentation is available at:

```
https://api.notes.zegaru.com/api/docs/
```
