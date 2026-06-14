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
