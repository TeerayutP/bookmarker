import os
from dotenv import load_dotenv

load_dotenv()  # no-op in production where env vars are injected directly

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import books, authors, categories, reviews, auth, stats, library

app = FastAPI(title="Bookmarker API")

_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [o.strip() for o in _origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/covers", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(library.router)
app.include_router(authors.router)
app.include_router(categories.router)
app.include_router(reviews.router)
app.include_router(stats.router)

@app.get("/health")
def health():
    return {"status": "ok"}
