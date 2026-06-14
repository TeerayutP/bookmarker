from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import review as crud
from ..schemas.review import ReviewCreate, ReviewUpdate, ReviewOut
from ..database import get_db
from ..core.security import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"], dependencies=[Depends(get_current_user)])

def _get_or_404(db: Session, review_id: int):
    review = crud.get(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

@router.get("", response_model=list[ReviewOut])
def list_reviews(book_id: int | None = None, db: Session = Depends(get_db)):
    return crud.get_all(db, book_id)

@router.post("", response_model=ReviewOut, status_code=201)
def create_review(data: ReviewCreate, db: Session = Depends(get_db)):
    return crud.create(db, data)

@router.get("/{review_id}", response_model=ReviewOut)
def get_review(review_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, review_id)

@router.put("/{review_id}", response_model=ReviewOut)
def update_review(review_id: int, data: ReviewUpdate, db: Session = Depends(get_db)):
    return crud.update(db, _get_or_404(db, review_id), data)

@router.delete("/{review_id}", status_code=204)
def delete_review(review_id: int, db: Session = Depends(get_db)):
    crud.delete(db, _get_or_404(db, review_id))
