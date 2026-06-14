import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from . import models  # registers all models with Base
from .routers import books, authors, categories, reviews, auth, stats

Base.metadata.create_all(bind=engine)

from sqlalchemy import text

with engine.connect() as _conn:
    exists = _conn.execute(text(
        "SELECT COUNT(*) FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = 'books' AND column_name = 'synopsis'"
    )).scalar()
    if not exists:
        _conn.execute(text("ALTER TABLE books ADD COLUMN synopsis TEXT NULL"))
        _conn.commit()

app = FastAPI(title="Bookmarker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/covers", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(authors.router)
app.include_router(categories.router)
app.include_router(reviews.router)
app.include_router(stats.router)

@app.get("/health")
def health():
    return {"status": "ok"}
