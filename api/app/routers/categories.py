from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import category as crud
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from ..database import get_db

router = APIRouter(prefix="/categories", tags=["categories"])

def _get_or_404(db: Session, category_id: int):
    category = crud.get(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return crud.get_all(db)

@router.post("", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    return crud.create(db, data)

@router.get("/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, category_id)

@router.put("/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, data: CategoryUpdate, db: Session = Depends(get_db)):
    return crud.update(db, _get_or_404(db, category_id), data)

@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    crud.delete(db, _get_or_404(db, category_id))
