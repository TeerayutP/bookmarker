from datetime import datetime
from sqlalchemy.orm import Session
from ..models.book import Book, BookStatus
from ..schemas.book import BookCreate, BookUpdate

_SORT_MAP = {
    "title_asc": Book.title.asc(),
    "title_desc": Book.title.desc(),
    "updated_at_desc": Book.updated_at.desc(),
    "updated_at_asc": Book.updated_at.asc(),
    "created_at_desc": Book.created_at.desc(),
}

def get_all(
    db: Session,
    status: BookStatus | None = None,
    skip: int = 0,
    limit: int = 20,
    sort: str = "updated_at_desc",
) -> list[Book]:
    q = db.query(Book)
    if status:
        q = q.filter(Book.status == status)
    order = _SORT_MAP.get(sort, Book.updated_at.desc())
    return q.order_by(order).offset(skip).limit(limit).all()

def get(db: Session, book_id: int) -> Book | None:
    return db.query(Book).filter(Book.id == book_id).first()

def create(db: Session, data: BookCreate) -> Book:
    book = Book(**data.model_dump(exclude={'category_name'}))
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

def update(db: Session, book: Book, data: BookUpdate) -> Book:
    for field, value in data.model_dump(exclude_unset=True, exclude={'category_name'}).items():
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
