# Bookmarker — Claude Guidelines

## Workflow Rules (mandatory for every task)

1. **Task list first** — create and display a task list before any implementation begins; never start coding without one.
2. **Show and update progress** — keep the task list visible in responses; mark each item completed in real time as it's done.
3. **Model tiering** — assign subtasks to the most cost-effective model tier:
   - **Haiku 4.5** (`claude-haiku-4-5`) — simple, fast, repetitive work (formatting, boilerplate, quick lookups)
   - **Sonnet 4.6** (`claude-sonnet-4-6`) — balanced tasks (feature implementation, refactoring, code review)
   - **Opus 4.8** (`claude-opus-4-8`) — complex reasoning (architecture decisions, hard bugs, design tradeoffs)
4. **Reduce token usage** — be concise; avoid redundant tool calls, unnecessary re-reads, or verbose responses.

## User Profile

- Fullstack developer — assume familiarity with both frontend and backend; no need to over-explain stack fundamentals.

## Code Style Defaults

- No comments unless the WHY is non-obvious.
- No error handling for scenarios that cannot happen.
- No abstractions beyond what the current task requires.
- Prefer editing existing files over creating new ones.

---

## Project Plan: Bookmarker SPA

### Goal
A personal reading tracker SPA to manage a list of books and track current chapter position.

### Architecture

```
bookmarker/
├── docker-compose.yml
├── ui/                  # Vite + React + Redux + React Router + TypeScript + HeroUI v2 + Tailwind
│   ├── Dockerfile
│   └── src/
└── api/                 # FastAPI + MySQL
    ├── Dockerfile
    └── app/
```

**Docker services:** `ui` (port 5173), `api` (port 8000), `db` (MySQL, port 3306)

### Data Model

**Book**
- `id` — int, PK, auto-increment
- `title` — varchar
- `author` — varchar
- `total_chapters` — int (nullable)
- `current_chapter` — int (default 0)
- `status` — enum: `reading` | `completed` | `on_hold` | `dropped`
- `cover_url` — varchar (nullable)
- `notes` — text (nullable)
- `created_at`, `updated_at` — datetime

### API Endpoints (FastAPI)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/books` | List all books (filterable by status) |
| POST | `/books` | Add a book |
| GET | `/books/{id}` | Get a book |
| PUT | `/books/{id}` | Update book (title, chapter, status, etc.) |
| DELETE | `/books/{id}` | Delete a book |
| PATCH | `/books/{id}/chapter` | Quick-update current chapter |

### UI Pages & Components

- **`/`** — Book list with filter tabs (All / Reading / Completed / On Hold / Dropped), search bar, and book cards
- **`/books/new`** — Add book form
- **`/books/:id`** — Book detail / edit page with chapter stepper

**Redux slices:** `booksSlice` (CRUD + filter state)

### Implementation Tasks

#### Phase 1 — Project Scaffold
- [ ] `docker-compose.yml` with `ui`, `api`, `db` services and volumes
- [ ] `ui/Dockerfile` (Node 20, Vite dev server)
- [ ] `api/Dockerfile` (Python 3.12, FastAPI + uvicorn)
- [ ] `ui/` — Vite + React + TS scaffold; install HeroUI v2, Tailwind, Redux Toolkit, React Router
- [ ] `api/` — FastAPI project structure with SQLAlchemy + PyMySQL, Alembic for migrations

#### Phase 2 — Backend
- [ ] SQLAlchemy `Book` model + Alembic initial migration
- [ ] Pydantic schemas (BookCreate, BookUpdate, BookOut)
- [ ] CRUD service layer
- [ ] All REST endpoints wired up
- [ ] CORS configured for `http://localhost:5173`

#### Phase 3 — Frontend
- [ ] Tailwind + HeroUI v2 setup and theme config
- [ ] Redux store + `booksSlice` with async thunks calling the API
- [ ] React Router layout: root layout with nav
- [ ] Book list page with filter tabs and search
- [ ] Add book form page
- [ ] Book detail/edit page with chapter stepper

#### Phase 4 — Polish
- [ ] Loading and error states (HeroUI Spinner / toast)
- [ ] Progress bar per book card (current / total chapters)
- [ ] Optimistic UI for chapter updates
- [ ] Responsive layout check

### Dev Commands (after implementation)
```bash
docker compose up --build     # first run
docker compose up             # subsequent runs
docker compose down -v        # teardown with volumes
```

UI: http://localhost:5173 | API docs: http://localhost:8000/docs

### Database Migrations (Alembic)

Migrations live in `api/migrations/versions/`. The API container runs `alembic upgrade head` automatically on startup before uvicorn.

```bash
# Inside the api container (or with venv active in api/):
alembic revision --autogenerate -m "describe the change"   # generate a new migration
alembic upgrade head                                        # apply all pending migrations
alembic downgrade -1                                        # roll back one migration
alembic current                                             # show current revision
alembic history                                             # show migration history

# First time with an existing DB (tables already exist — skip creating them):
alembic stamp head
```

---

## Portfolio Enhancement Plan

> Phases ordered by recruiter impact. Complete in order.

### Phase 5 — Deploy (Live Demo URL)

**Goal:** Have a publicly accessible URL to put on the resume/GitHub.

- [ ] Dockerize for production — add `docker-compose.prod.yml` with env-var–based config
- [ ] Add `api/.env.example` and `ui/.env.example` documenting all required vars
- [ ] Deploy MySQL to PlanetScale (free tier) or Railway managed DB
- [ ] Deploy FastAPI backend to Railway or Render (connect to managed DB)
- [ ] Build React app for production (`vite build`) and deploy to Vercel or Netlify
- [ ] Set `VITE_API_URL` env var on Vercel/Netlify pointing to the deployed backend
- [ ] Configure CORS on the API to allow the deployed frontend origin
- [ ] Smoke-test login, add book, upload cover, and chapter update on the live URL

### Phase 6 — README & GitHub Presentation

**Goal:** Make the GitHub repo look professional at first glance.

- [ ] Write `README.md` with: project description, tech stack badges, live demo link, and local dev setup
- [ ] Add architecture diagram (ASCII or image) showing ui ↔ api ↔ db
- [ ] Add 2–3 screenshots (book list, book detail, mobile view)
- [ ] Document all env vars in README
- [ ] Add `CONTRIBUTING.md` (brief — just shows awareness)

### Phase 7 — Dashboard & Statistics ✅

**Goal:** Visually impressive page that showcases end-to-end data wiring.

- [x] Add `GET /stats` endpoint returning: total books by status, books added per month (last 6 months), average chapters per book, top categories
- [x] Add `statsSlice` in Redux with async thunk calling `/stats`
- [x] Install `recharts` in the UI
- [x] Build `/dashboard` page with:
  - [x] Summary cards — total books, currently reading, completed this year
  - [x] Donut chart — books by status
  - [x] Bar chart — books added per month (last 6 months)
  - [x] Progress toward reading goal (hardcoded or user-set)
- [x] Add Dashboard link to nav (desktop sidebar + mobile bottom nav)

### Phase 8 — Reading Goals

**Goal:** Simple engagement feature; pairs well with the dashboard.

- [ ] Add `goal_year` and `goal_count` columns to `User` model + migration
- [ ] Add `PATCH /users/me/goal` endpoint
- [ ] Add goal form (year + target count) on a `/settings` or `/profile` page
- [ ] Wire goal progress into the dashboard summary card
- [ ] Show "X of Y books completed this year" with a HeroUI Progress bar

### Phase 9 — Google Books API Integration

**Goal:** Shows external API integration; makes the Add Book flow feel polished.

- [ ] Add a search-by-title input on the Add Book form (client-side only, calls Google Books API directly from the browser)
- [ ] Display a dropdown of results with cover thumbnail, title, author
- [ ] On selection: auto-fill title, author, cover URL, and total pages (mapped to `total_chapters`)
- [ ] Keep all fields editable after auto-fill
- [ ] Debounce the search input (300 ms)

### Phase 10 — Backend Tests

**Goal:** Demonstrates engineering discipline; most portfolio projects have zero tests.

- [ ] Set up `pytest` + `httpx` (async test client) in `api/`
- [ ] Add `conftest.py` with a test DB fixture (SQLite in-memory)
- [ ] Auth tests: register, login, invalid credentials
- [ ] Books tests: create, read, update, delete, chapter patch
- [ ] Categories & authors tests: CRUD happy paths
- [ ] Run tests in CI — add `.github/workflows/test.yml` running `pytest` on push

### Phase 11 — UX Polish ✅

**Goal:** Small touches that make the app feel production-quality.

- [x] Pagination or infinite scroll on the book list (backend: add `skip`/`limit` query params; frontend: "Load more" button)
- [x] Sorting on book list — by title A–Z, recently updated, reading progress %
- [x] Dark mode toggle using HeroUI v2 `ThemeProvider` — persist choice in `localStorage`
- [x] CSV export — `GET /books/export` returns CSV; frontend has a download button on the book list
- [x] Confirm dialog before deleting a book (currently fires immediately)
