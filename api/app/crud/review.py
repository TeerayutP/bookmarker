from sqlalchemy.orm import Session
from ..models.review import Review
from ..schemas.review import ReviewCreate, ReviewUpdate

def get_all(db: Session, book_id: int | None = None) -> list[Review]:
    q = db.query(Review)
    if book_id:
        q = q.filter(Review.book_id == book_id)
    return q.order_by(Review.created_at.desc()).all()

def get(db: Session, review_id: int) -> Review | None:
    return db.query(Review).filter(Review.id == review_id).first()

def create(db: Session, data: ReviewCreate) -> Review:
    review = Review(**data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

def update(db: Session, review: Review, data: ReviewUpdate) -> Review:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(review, field, value)
    db.commit()
    db.refresh(review)
    return review

def delete(db: Session, review: Review) -> None:
    db.delete(review)
    db.commit()
