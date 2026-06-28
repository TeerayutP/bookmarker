# Library + Reading List Feature Workflow

## Goal
Split the current global book list into two layers:
- **Shared Library** — all users can browse; a catalogue of books
- **Personal Reading List** — each user's own list with progress, status, notes, rating

---

## DB Schema

### `library_books` (rename/replace current `books` — shared catalogue)
```
id               INT PK AUTO_INCREMENT
title            VARCHAR NOT NULL
author           VARCHAR NOT NULL
total_chapters   INT nullable
cover_url        VARCHAR nullable
added_by_user_id INT FK → users (nullable)
created_at       DATETIME
updated_at       DATETIME
```

### `user_books` (new — per-user reading list)
```
id               INT PK AUTO_INCREMENT
user_id          INT FK → users NOT NULL
book_id          INT FK → library_books NOT NULL
current_chapter  INT DEFAULT 0
status           ENUM('reading','completed','on_hold','dropped')
notes            TEXT nullable
rating           TINYINT nullable (1–5)
added_at         DATETIME
updated_at       DATETIME
UNIQUE (user_id, book_id)
```

### Categories & Authors
No schema changes needed — keep existing `book_categories` join table but point FK at `library_books.id`.

---

## Data Migration Plan

```sql
-- 1. Copy existing books into library_books (drop progress columns)
INSERT INTO library_books (id, title, author, total_chapters, cover_url, created_at, updated_at)
SELECT id, title, author, total_chapters, cover_url, created_at, updated_at FROM books;

-- 2. user_books starts empty (old rows have no user_id — progress cannot be reassigned)
--    Optional: assign all to user_id=1 to preserve progress for the first user

-- 3. Drop old books table after verifying migration
```

---

## API Endpoints

### Library (shared, visible to all authenticated users)

| Method | Path | Description |
|---|---|---|
| GET | `/library` | Browse all library books (search, category filter, pagination) |
| POST | `/library` | Add a new book to the library |
| GET | `/library/{id}` | Get library book detail |

### Reading List (private, scoped to current user via JWT)

| Method | Path | Description |
|---|---|---|
| GET | `/books` | Current user's list only |
| POST | `/books` | Add to list — dual-path (see below) |
| PUT | `/books/{id}` | Update progress (chapter, status, notes, rating) |
| DELETE | `/books/{id}` | Remove from list (library entry stays) |
| PATCH | `/books/{id}/chapter` | Quick chapter update |
| GET | `/stats` | Stats scoped to current user |
| GET | `/books/export` | CSV export scoped to current user |

### POST `/books` dual-path logic
```python
if body.book_id:
    # book already in library → create user_books row only
else:
    # create library_books row first, then create user_books row
```

---

## Backend Implementation Order

1. **Alembic migration**
   - Create `library_books` table
   - Create `user_books` table
   - Migrate data from `books` → `library_books`
   - Update `book_categories` FK to point to `library_books`
   - Drop old `books` table

2. **SQLAlchemy models**
   - `LibraryBook` model
   - `UserBook` model (with relationship to `LibraryBook` and `User`)

3. **Pydantic schemas**
   - `LibraryBookCreate`, `LibraryBookOut`
   - `UserBookCreate` (`book_id` optional — if omitted, creates library entry too)
   - `UserBookOut` (flat response: merged library + user progress fields)

4. **CRUD**
   - `crud/library.py` — create, get, list
   - `crud/user_book.py` — create (with dual-path), get, list by user, update, delete

5. **Routers**
   - `routers/library.py` — new
   - `routers/books.py` — rewrite; all queries filter by `current_user.id`
   - `routers/stats.py` — add `WHERE user_id = current_user.id`

---

## Frontend Implementation Order

6. **`librarySlice`** (new Redux slice)
   ```ts
   state: { items: LibraryBook[], loading, error }
   thunks: fetchLibrary(), addToLibrary(data)
   ```

7. **`booksSlice` refactor**
   - `BookOut` type updated: add `book_id`, `rating`, nested `title`/`author`/`cover_url` from join
   - New thunk: `addToReadingList(bookId: number)`
   - All existing thunks already scoped by backend — no frontend filter needed

8. **`/library` page** (new)
   - Grid of library books with search + filter
   - "Add to My List" button → POST `/books` with `book_id`
   - "In My List" badge (check against `booksSlice.items`)
   - "Add New Book" → `/library/new` form

9. **`/` reading list page** (update)
   - Now shows only current user's `user_books`
   - Add "Browse Library" link/button

10. **Book detail `/books/:id`** (update)
    - Add `rating` field (1–5 stars)
    - Add "View in Library" link → `/library/:bookId`

11. **Nav** — add Library link alongside Dashboard

---

## Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Can users add books not in library? | Yes — POST `/books` without `book_id` | Avoids friction; auto-creates library entry |
| Is library entry deleted when user removes from list? | No | Library is shared; other users may have it |
| Are reading stats per-user? | Yes | `/stats` filters by `user_id` from JWT |
| Can users edit library books? | TBD — suggest: only `added_by_user_id` or admin | Prevents others overwriting shared data |

---

## Files to Create / Modify

### Backend (`api/`)
| Action | File |
|---|---|
| Create | `migrations/versions/0002_library_and_user_books.py` |
| Create | `app/models/library_book.py` |
| Create | `app/models/user_book.py` |
| Create | `app/schemas/library_book.py` |
| Create | `app/schemas/user_book.py` |
| Create | `app/crud/library.py` |
| Create | `app/crud/user_book.py` |
| Create | `app/routers/library.py` |
| Modify | `app/routers/books.py` |
| Modify | `app/routers/stats.py` |
| Modify | `app/main.py` (register new router) |
| Modify | `app/models/__init__.py` |

### Frontend (`ui/src/`)
| Action | File |
|---|---|
| Create | `features/library/librarySlice.ts` |
| Create | `features/library/LibraryPage.tsx` |
| Create | `features/library/LibraryNewPage.tsx` |
| Modify | `features/books/booksSlice.ts` |
| Modify | `features/books/BookDetailPage.tsx` |
| Modify | `features/books/BookListPage.tsx` |
| Modify | `store/index.ts` (add librarySlice) |
| Modify | `App.tsx` (add `/library` routes) |
| Modify | nav component (add Library link) |
