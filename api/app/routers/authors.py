from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import author as crud
from ..schemas.author import AuthorCreate, AuthorUpdate, AuthorOut
from ..database import get_db
from ..core.security import get_current_user

router = APIRouter(prefix="/authors", tags=["authors"], dependencies=[Depends(get_current_user)])

def _get_or_404(db: Session, author_id: int):
    author = crud.get(db, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author

@router.get("", response_model=list[AuthorOut])
def list_authors(db: Session = Depends(get_db)):
    return crud.get_all(db)

@router.post("", response_model=AuthorOut, status_code=201)
def create_author(data: AuthorCreate, db: Session = Depends(get_db)):
    return crud.create(db, data)

@router.get("/{author_id}", response_model=AuthorOut)
def get_author(author_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, author_id)

@router.put("/{author_id}", response_model=AuthorOut)
def update_author(author_id: int, data: AuthorUpdate, db: Session = Depends(get_db)):
    return crud.update(db, _get_or_404(db, author_id), data)

@router.delete("/{author_id}", status_code=204)
def delete_author(author_id: int, db: Session = Depends(get_db)):
    crud.delete(db, _get_or_404(db, author_id))
