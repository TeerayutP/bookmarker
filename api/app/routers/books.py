from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import book as crud, author as author_crud, category as category_crud
from ..schemas.book import BookCreate, BookUpdate, ChapterPatch, BookOut
from ..models.book import BookStatus
from ..database import get_db
from ..core.security import get_current_user

router = APIRouter(prefix="/books", tags=["books"], dependencies=[Depends(get_current_user)])

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

@router.get("", response_model=list[BookOut])
def list_books(status: BookStatus | None = None, db: Session = Depends(get_db)):
    return crud.get_all(db, status)

@router.post("", response_model=BookOut, status_code=201)
def create_book(data: BookCreate, db: Session = Depends(get_db)):
    return crud.create(db, _resolve(db, data))

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
