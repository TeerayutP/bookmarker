from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import book as crud
from ..schemas.book import BookCreate, BookUpdate, ChapterPatch, BookOut
from ..models.book import BookStatus
from ..database import get_db
from ..core.security import get_current_user

router = APIRouter(prefix="/books", tags=["books"], dependencies=[Depends(get_current_user)])

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
    return crud.create(db, data)

@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, book_id)

@router.put("/{book_id}", response_model=BookOut)
def update_book(book_id: int, data: BookUpdate, db: Session = Depends(get_db)):
    return crud.update(db, _get_or_404(db, book_id), data)

@router.patch("/{book_id}/chapter", response_model=BookOut)
def patch_chapter(book_id: int, data: ChapterPatch, db: Session = Depends(get_db)):
    return crud.patch_chapter(db, _get_or_404(db, book_id), data.current_chapter)

@router.delete("/{book_id}", status_code=204)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    crud.delete(db, _get_or_404(db, book_id))
