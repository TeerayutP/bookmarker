# Deployment Guide

> **Stack:** FastAPI · MySQL · React (Vite) · Docker  
> **Target:** Railway (API + DB) · Vercel (UI)  
> **Est. time:** ~30 min on first deploy, ~5 min for subsequent pushes

---

## Overview

```
Vercel (React SPA)
      │  HTTPS
      ▼
Railway (FastAPI)  ──▶  Railway (MySQL)
```

All three services run on free tiers. No credit card required for Railway's Hobby plan trial or Vercel's free tier.

---

## Prerequisites

- [Railway CLI](https://docs.railway.app/guides/cli) — `npm i -g @railway/cli`
- [Vercel CLI](https://vercel.com/docs/cli) — `npm i -g vercel`
- Docker installed locally (only needed for local testing of the production build)

---

## 1 — Database (Railway MySQL)

```bash
railway login
railway init          # create a new project, name it "bookmarker"
railway add --plugin mysql
```

Copy the connection string from the Railway dashboard:  
**Settings → Variables → `MYSQL_URL`**  
It looks like: `mysql://user:pass@host:port/railway`

Convert it to PyMySQL format for the API:
```
mysql+pymysql://user:pass@host:port/railway
```

---

## 2 — Backend (Railway FastAPI)

### 2a — Environment variables

In the Railway project dashboard, add these variables to the **api** service:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `mysql+pymysql://...` (from step 1) |
| `SECRET_KEY` | a long random string (e.g. `openssl rand -hex 32`) |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` (fill in after step 3) |

### 2b — Update CORS to read from env

Edit `api/app/main.py` — replace the hardcoded origins list:

```python
import os

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2c — Add a `railway.json` (optional but clean)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "DOCKERFILE", "dockerfilePath": "api/Dockerfile" },
  "deploy": { "startCommand": "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT" }
}
```

> Railway injects `$PORT` automatically — the app must bind to it, not a hardcoded 8000.

Update `api/Dockerfile` to use `$PORT`:

```dockerfile
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### 2d — Deploy

```bash
railway up --service api
```

Railway builds the Dockerfile, runs migrations, and starts uvicorn. The public URL will be shown in the dashboard — copy it (e.g. `https://bookmarker-api.up.railway.app`).

Verify:
```
https://bookmarker-api.up.railway.app/health   # → {"status":"ok"}
https://bookmarker-api.up.railway.app/docs     # Swagger UI
```

---

## 3 — Frontend (Vercel)

### 3a — Set the API URL

```bash
cd ui
vercel env add VITE_API_URL
# paste: https://bookmarker-api.up.railway.app
```

Or set it in the Vercel dashboard under **Project → Settings → Environment Variables**.

### 3b — Deploy

```bash
vercel --prod
```

Vercel detects the Vite project automatically:
- **Build command:** `npm run build`  
- **Output directory:** `dist`  
- **Install command:** `npm install`

Copy the live URL (e.g. `https://bookmarker.vercel.app`).

### 3c — Update CORS on the backend

Go back to Railway → api service → Variables, set:
```
ALLOWED_ORIGINS=https://bookmarker.vercel.app
```

Railway redeploys automatically.

---

## 4 — Verify End-to-End

1. Open the Vercel URL in an incognito window.
2. Register a new account.
3. Add a book, upload a cover, update a chapter.
4. Check the Dashboard page — charts should load.
5. Export CSV — confirm download works.
6. Open DevTools Network tab — all API calls should be to the Railway URL with `200` responses.

---

## Environment Variable Reference

### `api/.env.example`
```env
DATABASE_URL=mysql+pymysql://user:pass@host:3306/bookmarker
SECRET_KEY=change-this-to-a-random-64-char-string
ALLOWED_ORIGINS=http://localhost:5173
```

### `ui/.env.example`
```env
VITE_API_URL=http://localhost:8000
```

---

## Local Production Build Test

Before pushing, you can smoke-test the production build locally:

```bash
# Build and run with production env vars
DATABASE_URL="..." SECRET_KEY="..." docker compose -f docker-compose.yml up --build

# Or test the UI build in isolation
cd ui && npm run build && npx serve dist -p 4173
```

---

## Continuous Deployment

Both Railway and Vercel watch the connected GitHub branch (`main`) and redeploy on every push automatically once the repo is linked in their dashboards.

To link:
- **Railway:** Project → Settings → Source → Connect GitHub repo → select branch
- **Vercel:** `vercel link` then `vercel git connect`

After that, a merged PR to `main` is all it takes to ship.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| API returns 500 on startup | Check Railway logs — usually a failed migration or bad `DATABASE_URL` |
| CORS error in browser | Make sure `ALLOWED_ORIGINS` on Railway exactly matches the Vercel URL (no trailing slash) |
| Vercel build fails | Confirm `VITE_API_URL` is set in Vercel env vars for the Production environment |
| Uploaded cover images don't persist | Railway's filesystem is ephemeral — move `uploads/` to S3 or Cloudflare R2 for persistence |
| `$PORT` binding error | Ensure the Dockerfile CMD uses `${PORT:-8000}`, not a hardcoded port |
