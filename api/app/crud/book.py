from datetime import datetime
from sqlalchemy.orm import Session
from ..models.book import Book, BookStatus
from ..schemas.book import BookCreate, BookUpdate

def get_all(db: Session, status: BookStatus | None = None) -> list[Book]:
    q = db.query(Book)
    if status:
        q = q.filter(Book.status == status)
    return q.order_by(Book.created_at.desc()).all()

def get(db: Session, book_id: int) -> Book | None:
    return db.query(Book).filter(Book.id == book_id).first()

def create(db: Session, data: BookCreate) -> Book:
    book = Book(**data.model_dump())
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

def update(db: Session, book: Book, data: BookUpdate) -> Book:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(book, field, value)
    book.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(book)
    return book

def patch_chapter(db: Session, book: Book, chapter: int) -> Book:
    book.current_chapter = chapter
    book.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(book)
    return book

def delete(db: Session, book: Book) -> None:
    db.delete(book)
    db.commit()
