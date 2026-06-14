import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from . import models  # registers all models with Base
from .routers import books, authors, categories, reviews, auth

Base.metadata.create_all(bind=engine)

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

@app.get("/health")
def health():
    return {"status": "ok"}
