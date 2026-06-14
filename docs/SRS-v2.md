# Software Requirements Specification — Bookmarker (v2)

**Version:** 2.0
**Date:** 2026-06-14
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for Bookmarker, a personal reading tracker single-page application. It is intended to guide development, testing, and future planning.

### 1.2 Scope
Bookmarker allows a single authenticated user to manage a personal library of books: tracking reading progress by chapter, categorizing books, managing author profiles, and viewing reading statistics. The system does not support multi-user collaboration, social features, or e-commerce.

### 1.3 Definitions

| Term | Definition |
|------|-----------|
| Book | An entry in the library with title, author, chapter tracking, and metadata |
| Chapter | The unit of reading progress (integer, zero-based) |
| Status | Reading state of a book: `reading`, `completed`, `on_hold`, `dropped` |
| Category | A genre/tag grouping for books (e.g. Fantasy, Science Fiction) |
| Author | A named person linked to one or more books |
| JWT | JSON Web Token used for stateless authentication |
| Cover | A book cover image, either from a URL or an uploaded file |

### 1.4 References
- HeroUI v2 component library
- FastAPI documentation
- SQLAlchemy 2.0 ORM

---

## 2. Overall Description

### 2.1 Product Perspective
Bookmarker is a standalone SPA backed by a REST API. It runs entirely within Docker Compose and requires no third-party services at runtime. The frontend communicates exclusively with the local API; no external data sources are used post-seed.

### 2.2 User Characteristics
**Primary user:** A single reader (the owner) who:
- Is comfortable with web applications
- Reads multiple books in parallel
- Wants frictionless chapter updates without navigating away
- May manage 10–200 books over time

### 2.3 Assumptions and Dependencies
- Single-user system; data isolation per account is not a strict concern
- MySQL is the sole database engine
- All routes except `/login` and `/register` require a valid JWT
- Author names in Books are stored as plain text; author records are linked by case-insensitive name match
- Cover files are served from the API container's filesystem (not a CDN)

### 2.4 Out of Scope
- Multi-user / social features (friends, shared lists, public profiles)
- Reading session timers or daily streak tracking
- Integration with external book APIs (Goodreads, Google Books, OpenLibrary)
- Push notifications or email reminders
- Mobile native applications
- Offline mode / service worker caching
- Book ratings or reviews visible to others
- Export to CSV / PDF

---

## 3. Functional Requirements

### 3.1 Authentication

| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | The system shall allow a visitor to register with a unique username, unique email address, and a password of at least 8 characters. |
| FR-AUTH-02 | The system shall reject registration if the username or email is already taken, returning a descriptive error message. |
| FR-AUTH-03 | The system shall authenticate a user by username and password, returning a JWT valid for 7 days. |
| FR-AUTH-04 | The system shall reject requests to protected endpoints that carry no token, an expired token, or a tampered token with HTTP 401. |
| FR-AUTH-05 | The frontend shall redirect unauthenticated users to `/login` automatically on any 401 response. |
| FR-AUTH-06 | The frontend shall clear the stored token and redirect to `/login` when the user logs out. |
| FR-AUTH-07 | The system shall expose a `GET /auth/me` endpoint that returns the current user's id, username, and email. |

### 3.2 Books

| ID | Requirement |
|----|-------------|
| FR-BOOK-01 | The system shall allow the user to create a book with: title (required), author (required), total chapters (optional integer), current chapter (default 0), status (default `reading`), cover URL (optional), notes (optional text), category (optional — by name or id). |
| FR-BOOK-02 | When a book is created or updated with an author name not yet in the Authors table, the system shall automatically create an Author record for that name. |
| FR-BOOK-03 | When a book is created or updated with a `category_name` not yet in the Categories table, the system shall automatically create a Category record with an auto-generated slug. |
| FR-BOOK-04 | The system shall return all books for the authenticated user, ordered by `updated_at` descending. |
| FR-BOOK-05 | The system shall support filtering books by status via query parameter. |
| FR-BOOK-06 | The frontend shall support additional client-side filtering by category and text search across title and author fields. |
| FR-BOOK-07 | The system shall allow updating any subset of book fields via `PUT /books/{id}`. |
| FR-BOOK-08 | The system shall provide a dedicated `PATCH /books/{id}/chapter` endpoint that updates only `current_chapter` and refreshes `updated_at`. |
| FR-BOOK-09 | `current_chapter` shall never be set below 0 or above `total_chapters` (when `total_chapters` is set). |
| FR-BOOK-10 | The system shall allow deleting a book; deletion shall not cascade to Author or Category records. |
| FR-BOOK-11 | The system shall accept image file uploads (JPEG, PNG, WebP, GIF; max content-type validated) and store them under `uploads/covers/` with a UUID filename, serving them at `/static/covers/{filename}`. |
| FR-BOOK-12 | The frontend shall display a reading progress bar (current / total chapters) on book cards and the detail page when `total_chapters` is set. |
| FR-BOOK-13 | The frontend shall support two view modes for the book list: grid (cover-dominant cards) and list (horizontal wide cards with notes). The selected mode shall persist across sessions via `localStorage`. |

### 3.3 Authors

| ID | Requirement |
|----|-------------|
| FR-AUTH2-01 | The system shall maintain an Authors table with name and optional bio. |
| FR-AUTH2-02 | The system shall allow creating, reading, updating (name, bio), and deleting author records. |
| FR-AUTH2-03 | The frontend Author list page shall display each author as a wide horizontal card with their associated books listed inline. |
| FR-AUTH2-04 | Clicking an author name on any book card or book detail page shall navigate to that author's detail page. |
| FR-AUTH2-05 | The Author detail page shall list all books whose `author` field matches the author's name (case-insensitive) with cover thumbnail, status chip, and progress bar. |
| FR-AUTH2-06 | Deleting an author record shall not delete or modify linked books; the books' `author` field (plain text) is preserved. |

### 3.4 Categories

| ID | Requirement |
|----|-------------|
| FR-CAT-01 | The system shall maintain a Categories table with name and URL-safe slug. |
| FR-CAT-02 | Slugs shall be auto-generated from the category name and guaranteed unique (suffix `-2`, `-3`, … on collision). |
| FR-CAT-03 | The system shall allow creating, reading, updating, and deleting category records. |
| FR-CAT-04 | Deleting a category shall set `category_id` to NULL on all linked books (`ON DELETE SET NULL`). |
| FR-CAT-05 | The frontend shall provide a category dropdown filter on the book list page. |

### 3.5 Cover Images

| ID | Requirement |
|----|-------------|
| FR-COV-01 | A book cover may be specified as an external URL or as a locally uploaded file; both are stored in the `cover_url` field. |
| FR-COV-02 | Locally uploaded covers are stored as `{uuid}.{ext}` files and served at `/static/covers/`. |
| FR-COV-03 | The frontend shall resolve paths starting with `/` by prepending the API base URL (`VITE_API_URL`); external URLs are used as-is. |
| FR-COV-04 | If a cover URL fails to load, the UI shall fall back to a generated gradient placeholder showing the book's initial. |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | API responses for list endpoints (`/books`, `/authors`, `/categories`) shall complete within 500 ms for libraries up to 500 books on a local Docker network. |
| NFR-PERF-02 | Cover image uploads shall be accepted up to 5 MB per file. |
| NFR-PERF-03 | The frontend shall not re-fetch the full book list on every chapter increment; `PATCH /books/{id}/chapter` shall update only the affected Redux slice entry. |

### 4.2 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | Passwords shall be hashed with bcrypt before storage; plaintext passwords shall never be logged or returned in any response. |
| NFR-SEC-02 | JWT secret shall be configurable via environment variable (`SECRET_KEY`); the default value shall not be used in production. |
| NFR-SEC-03 | Uploaded file types shall be validated by MIME type (not file extension alone); disallowed types shall return HTTP 400. |
| NFR-SEC-04 | CORS shall permit only `http://localhost:5173` in development; production origins must be configured explicitly. |
| NFR-SEC-05 | The API shall not expose stack traces or internal error details to the client in non-debug mode. |

### 4.3 Usability

| ID | Requirement |
|----|-------------|
| NFR-USE-01 | All interactive actions (save, delete, upload) shall show a loading indicator while in progress and disable the triggering control to prevent double-submission. |
| NFR-USE-02 | The layout shall be responsive and usable on viewports as narrow as 375 px (mobile portrait). |
| NFR-USE-03 | Author and category Autocomplete inputs shall suggest existing records while allowing free-text entry for new values. |
| NFR-USE-04 | Destructive actions (delete book, delete author, delete category) shall require an explicit user press; there shall be no accidental deletion from list navigation. |

### 4.4 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-MAINT-01 | The frontend shall be organized by feature (`features/books/`, `features/authors/`, `features/categories/`); shared utilities live in `lib/`. |
| NFR-MAINT-02 | The backend shall separate concerns into models, schemas, CRUD, and routers; business logic shall not live inside route handlers. |
| NFR-MAINT-03 | Environment-specific values (database URL, JWT secret, API base URL) shall be managed through environment variables / `.env` files, never hardcoded. |

### 4.5 Reliability

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | The system shall return meaningful HTTP error codes: 400 for validation errors, 401 for auth failures, 404 for missing resources, 422 for schema errors. |
| NFR-REL-02 | A 401 response from any API call shall trigger automatic logout and redirect on the frontend, preventing a stuck authenticated-but-expired state. |

---

## 5. System Constraints

- **Runtime environment:** Docker Compose with three services: `ui` (Node/Vite, port 5173), `api` (Python/uvicorn, port 8000), `db` (MySQL, port 3306).
- **Database:** MySQL 8; ORM is SQLAlchemy 2.0 with `Mapped`/`mapped_column` declarative style.
- **Token storage:** JWT is stored in `localStorage`; this is acceptable for a single-user personal tool but noted as a trade-off vs. `HttpOnly` cookies.
- **Author–book link:** The link between books and authors is by name string, not a foreign key. This keeps data entry frictionless but means author renames do not cascade to books.
- **No pagination:** All list endpoints return the full result set; suitable for personal libraries up to ~500 books.

---

## 6. Data Model

### User
| Field | Type | Notes |
|-------|------|-------|
| id | INT PK | Auto-increment |
| username | VARCHAR(50) | Unique |
| email | VARCHAR(255) | Unique |
| hashed_password | VARCHAR(255) | bcrypt |
| created_at | DATETIME | UTC |

### Book
| Field | Type | Notes |
|-------|------|-------|
| id | INT PK | Auto-increment |
| title | VARCHAR(255) | Required |
| author | VARCHAR(255) | Plain text, case-insensitive matched to Authors |
| total_chapters | INT | Nullable |
| current_chapter | INT | Default 0 |
| status | ENUM | `reading`, `completed`, `on_hold`, `dropped` |
| cover_url | VARCHAR(1024) | Nullable; external URL or `/static/covers/{uuid}.ext` |
| notes | TEXT | Nullable |
| category_id | INT FK | Nullable; `ON DELETE SET NULL` → categories.id |
| created_at | DATETIME | UTC |
| updated_at | DATETIME | UTC, auto-updated |

### Author
| Field | Type | Notes |
|-------|------|-------|
| id | INT PK | Auto-increment |
| name | VARCHAR(255) | Unique |
| bio | TEXT | Nullable |
| created_at | DATETIME | UTC |

### Category
| Field | Type | Notes |
|-------|------|-------|
| id | INT PK | Auto-increment |
| name | VARCHAR(255) | Unique |
| slug | VARCHAR(255) | Unique, auto-generated |
| created_at | DATETIME | UTC |

---

## 7. API Reference

### Authentication (`/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/auth/me` | Yes | Current user info |

### Books (`/books`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/books` | Yes | List books; `?status=` filter |
| POST | `/books` | Yes | Create book |
| GET | `/books/{id}` | Yes | Get single book |
| PUT | `/books/{id}` | Yes | Full update |
| DELETE | `/books/{id}` | Yes | Delete book |
| PATCH | `/books/{id}/chapter` | Yes | Update `current_chapter` only |
| POST | `/books/covers/upload` | Yes | Upload cover image file |

### Authors (`/authors`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/authors` | Yes | List authors |
| POST | `/authors` | Yes | Create author |
| GET | `/authors/{id}` | Yes | Get author |
| PUT | `/authors/{id}` | Yes | Update name/bio |
| DELETE | `/authors/{id}` | Yes | Delete author |

### Categories (`/categories`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/categories` | Yes | List categories |
| POST | `/categories` | Yes | Create category |
| PUT | `/categories/{id}` | Yes | Update category |
| DELETE | `/categories/{id}` | Yes | Delete category |

---

## 8. UI Pages & Routes

| Route | Page | Key Behaviour |
|-------|------|---------------|
| `/login` | Login | Public; JWT stored on success |
| `/register` | Register | Public; redirects to `/` on success |
| `/` | Book List | Grid/list toggle; status + category dropdowns; text search; sorted by updated_at |
| `/books/new` | Add Book | Cover preview panel; author/category Autocomplete with find-or-create |
| `/books/:id` | Book Detail | Chapter stepper; cover upload; edit inline; author name links to `/authors/:id` |
| `/authors` | Author List | Wide horizontal cards with inline book list per author |
| `/authors/new` | Add Author | Name + bio form |
| `/authors/:id` | Author Detail | Edit inline; book list filtered by author name |
| `/categories` | Category List | Color-coded pill rows; slug displayed |
| `/categories/new` | Add Category | Name form; slug auto-generated |
| `/categories/:id/edit` | Edit Category | Update name/slug |

---

## 9. Future Considerations

The following items are out of scope for the current version but worth tracking for a future release:

- **Server-side search and pagination** — `GET /books?q=&page=&limit=` to support larger libraries.
- **Reading statistics dashboard** — books per month, average completion time, genre breakdown.
- **Book ratings** — a 1–5 star personal rating field on Book.
- **Bulk import** — CSV upload to seed a library from an export.
- **Data export** — download the full library as JSON or CSV.
- **Start/end date tracking** — record when reading began and finished per book.
- **Tag system** — many-to-many book tagging more flexible than single category.
- **Cover image cleanup** — delete orphaned files from `uploads/covers/` when a book is deleted or cover changed.
