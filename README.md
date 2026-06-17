# Bookmarker

A personal reading tracker to manage books and follow your progress chapter by chapter.

**Live demo:** https://bookmarker-dun-three.vercel.app &nbsp;|&nbsp; **API docs:** https://api-production-6444.up.railway.app/docs

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## Features

- Add and manage books with cover images, status, notes, and chapter tracking
- Filter by reading status — Reading, Completed, On Hold, Dropped
- Chapter stepper with progress bar per book
- Dashboard with stats, donut chart (books by status), and monthly bar chart
- Dark mode, CSV export, sorting, and infinite scroll
- Confirm dialog before destructive actions
- Cover images — upload a file or fetch from a URL

## Architecture

```
Vercel (React SPA)
      │  HTTPS / REST
      ▼
Railway (FastAPI)  ──▶  Railway (MySQL 8)
```

```
bookmarker/
├── ui/          # Vite + React + TypeScript + Redux Toolkit + HeroUI v2 + Tailwind
└── api/         # FastAPI + SQLAlchemy + Alembic + PyMySQL
```

## Local Development

**Prerequisites:** Docker Desktop

```bash
git clone https://github.com/TeerayutP/bookmarker.git
cd bookmarker
docker compose up --build
```

| Service | URL |
|---|---|
| UI | http://localhost:5173 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |

## Environment Variables

### `api/.env`
```env
DATABASE_URL=mysql+pymysql://root:root@db:3306/bookmarker
SECRET_KEY=change-this-to-a-random-64-char-string
ALLOWED_ORIGINS=http://localhost:5173
```

### `ui/.env`
```env
VITE_API_URL=http://localhost:8000
```

## Database Migrations

```bash
# Inside the api container
alembic revision --autogenerate -m "describe change"
alembic upgrade head
alembic downgrade -1
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Redux Toolkit, React Router v6 |
| UI library | HeroUI v2, Tailwind CSS, Recharts |
| Backend | FastAPI, SQLAlchemy 2, Alembic, Pydantic v2 |
| Database | MySQL 8 |
| Auth | JWT (python-jose + passlib bcrypt) |
| Infra | Docker Compose (dev), Railway (API + DB), Vercel (UI) |

## Deployment

See [DEPLOY.md](DEPLOY.md) for the full production deployment guide.
