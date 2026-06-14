import csv
import io
import os
import urllib.request
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..crud import book as crud, author as author_crud, category as category_crud
from ..schemas.book import BookCreate, BookUpdate, ChapterPatch, BookOut
from ..models.book import BookStatus
from ..database import get_db
from ..core.security import get_current_user

router = APIRouter(prefix="/books", tags=["books"], dependencies=[Depends(get_current_user)])

COVERS_DIR = "uploads/covers"
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

CONTENT_TYPE_EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
}


class CoverFetchRequest(BaseModel):
    url: str


def _resolve(db: Session, data: BookCreate | BookUpdate) -> BookCreate | BookUpdate:
    if data.author:
        author_crud.find_or_create(db, data.author)
    if data.category_name and not data.category_id:
        cat = category_crud.find_or_create(db, data.category_name)
        data = data.model_copy(update={"category_id": cat.id})
    return data


def _get_or_404(db: Session, book_id: int):
    book = crud.get(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("/covers/upload")
async def upload_cover(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only image files (jpeg, png, webp, gif) are allowed")
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    os.makedirs(COVERS_DIR, exist_ok=True)
    content = await file.read()
    with open(os.path.join(COVERS_DIR, filename), "wb") as f:
        f.write(content)
    return {"cover_url": f"/static/covers/{filename}"}


@router.post("/covers/fetch")
async def fetch_cover(payload: CoverFetchRequest):
    if not payload.url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")
    try:
        with urllib.request.urlopen(payload.url, timeout=10) as resp:
            content_type = resp.headers.get("Content-Type", "").split(";")[0].strip()
            data = resp.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to download image")
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="URL does not point to an image")
    if content_type in CONTENT_TYPE_EXT:
        ext = CONTENT_TYPE_EXT[content_type]
    else:
        path = payload.url.split("?")[0]
        ext = path.rsplit(".", 1)[-1].lower() if "." in path.rsplit("/", 1)[-1] else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    os.makedirs(COVERS_DIR, exist_ok=True)
    with open(os.path.join(COVERS_DIR, filename), "wb") as f:
        f.write(data)
    return {"cover_url": f"/static/covers/{filename}"}


@router.get("", response_model=list[BookOut])
def list_books(
    status: BookStatus | None = None,
    skip: int = 0,
    limit: int = 20,
    sort: str = "updated_at_desc",
    db: Session = Depends(get_db),
):
    return crud.get_all(db, status, skip, limit, sort)


@router.post("", response_model=BookOut, status_code=201)
def create_book(data: BookCreate, db: Session = Depends(get_db)):
    return crud.create(db, _resolve(db, data))


@router.get("/export")
def export_books(db: Session = Depends(get_db)):
    books = crud.get_all(db, limit=10000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "title", "author", "status", "current_chapter", "total_chapters", "category_id", "notes", "created_at", "updated_at"])
    for b in books:
        writer.writerow([b.id, b.title, b.author, b.status.value, b.current_chapter, b.total_chapters, b.category_id, b.notes, b.created_at, b.updated_at])
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=\"books.csv\""},
    )


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, book_id)


@router.put("/{book_id}", response_model=BookOut)
def update_book(book_id: int, data: BookUpdate, db: Session = Depends(get_db)):
    return crud.update(db, _get_or_404(db, book_id), _resolve(db, data))


@router.patch("/{book_id}/chapter", response_model=BookOut)
def patch_chapter(book_id: int, data: ChapterPatch, db: Session = Depends(get_db)):
    return crud.patch_chapter(db, _get_or_404(db, book_id), data.current_chapter)


@router.delete("/{book_id}", status_code=204)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    crud.delete(db, _get_or_404(db, book_id))
