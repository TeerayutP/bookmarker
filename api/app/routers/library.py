from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import library as crud
from ..crud import author as author_crud, category as category_crud
from ..schemas.library_book import LibraryBookCreate, LibraryBookOut
from ..database import get_db
from ..core.security import get_current_user
from ..models.user import User

router = APIRouter(prefix="/library", tags=["library"], dependencies=[Depends(get_current_user)])


def _resolve_category(db: Session, data: LibraryBookCreate) -> LibraryBookCreate:
    if data.category_name and not data.category_id:
        cat = category_crud.find_or_create(db, data.category_name)
        data = data.model_copy(update={"category_id": cat.id})
    return data


def _get_or_404(db: Session, book_id: int):
    book = crud.get(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Library book not found")
    return book


@router.get("", response_model=list[LibraryBookOut])
def list_library(
    search: str | None = None,
    category_id: int | None = None,
    skip: int = 0,
    limit: int = 40,
    db: Session = Depends(get_db),
):
    return crud.get_all(db, search=search, category_id=category_id, skip=skip, limit=limit)


@router.post("", response_model=LibraryBookOut, status_code=201)
def add_to_library(
    data: LibraryBookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.author:
        author_crud.find_or_create(db, data.author)
    data = _resolve_category(db, data)
    return crud.create(db, data, user_id=current_user.id)


@router.get("/{book_id}", response_model=LibraryBookOut)
def get_library_book(book_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, book_id)


@router.put("/{book_id}", response_model=LibraryBookOut)
def update_library_book(
    book_id: int,
    data: LibraryBookCreate,
    db: Session = Depends(get_db),
):
    book = _get_or_404(db, book_id)
    if data.author:
        author_crud.find_or_create(db, data.author)
    data = _resolve_category(db, data)
    return crud.update(db, book, **data.model_dump(exclude={'category_name'}))
