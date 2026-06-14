# Software Requirements Specification — Bookmarker (v1)

## 1. Overview

Bookmarker is a personal reading tracker web app. Users can add books, track which chapter they are on, and manage reading status.

---

## 2. Tech Stack

- **Frontend:** Vite + React + TypeScript + Redux Toolkit + React Router + HeroUI v2 + Tailwind CSS
- **Backend:** FastAPI + SQLAlchemy + PyMySQL
- **Database:** MySQL
- **Auth:** JWT (python-jose + passlib)
- **Deployment:** Docker Compose

---

## 3. Features

### Auth
- User can register with username, email, password
- User can log in and get a JWT token
- All book/author/category routes are protected

### Books
- User can add a book with title, author, total chapters, current chapter, status, cover URL, notes, category
- User can view all books in a list (grid or list view)
- User can filter books by status (all / reading / completed / on hold / dropped)
- User can filter books by category
- User can search books by title or author
- User can edit a book
- User can delete a book
- User can increment or decrement current chapter from the detail page
- Book cover can be uploaded as an image file
- Books are sorted by last updated

### Authors
- Authors are auto-created when a book is added
- User can view all authors
- User can view an author's detail page with their books listed
- User can edit an author (name, bio)
- User can delete an author

### Categories
- Categories are auto-created when a book is added with a category name
- User can view all categories
- User can add/edit/delete categories

### Cover Images
- Cover image can be a URL or uploaded file
- Uploaded files are stored in `uploads/covers/` and served via `/static/covers/`

---

## 4. Data Model

### User
- id, username, email, hashed_password, created_at

### Book
- id, title, author (varchar), total_chapters (nullable), current_chapter (default 0), status (enum), cover_url (nullable), notes (nullable), category_id (FK nullable), created_at, updated_at

### Author
- id, name, bio (nullable), created_at

### Category
- id, name, slug, created_at

---

## 5. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current user |
| GET | `/books` | List books (filter by status) |
| POST | `/books` | Create book |
| GET | `/books/{id}` | Get book |
| PUT | `/books/{id}` | Update book |
| DELETE | `/books/{id}` | Delete book |
| PATCH | `/books/{id}/chapter` | Update chapter |
| POST | `/books/covers/upload` | Upload cover image |
| GET | `/authors` | List authors |
| POST | `/authors` | Create author |
| GET | `/authors/{id}` | Get author |
| PUT | `/authors/{id}` | Update author |
| DELETE | `/authors/{id}` | Delete author |
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| PUT | `/categories/{id}` | Update category |
| DELETE | `/categories/{id}` | Delete category |

---

## 6. UI Pages

- `/login` — Login page
- `/register` — Register page
- `/` — Book list (grid/list view, status filter, category filter, search)
- `/books/new` — Add book form
- `/books/:id` — Book detail / edit / chapter stepper
- `/authors` — Author list (wide cards with inline book list)
- `/authors/new` — Add author form
- `/authors/:id` — Author detail / edit
- `/categories` — Category list
- `/categories/new` — Add category form
- `/categories/:id/edit` — Edit category form
