from datetime import datetime
from sqlalchemy.orm import Session
from ..models.library_book import LibraryBook
from ..schemas.library_book import LibraryBookCreate


def get_all(
    db: Session,
    search: str | None = None,
    category_id: int | None = None,
    skip: int = 0,
    limit: int = 20,
) -> list[LibraryBook]:
    q = db.query(LibraryBook)
    if search:
        term = f"%{search}%"
        q = q.filter(
            LibraryBook.title.ilike(term) | LibraryBook.author.ilike(term)
        )
    if category_id is not None:
        q = q.filter(LibraryBook.category_id == category_id)
    return q.order_by(LibraryBook.title.asc()).offset(skip).limit(limit).all()


def get(db: Session, book_id: int) -> LibraryBook | None:
    return db.query(LibraryBook).filter(LibraryBook.id == book_id).first()


def create(db: Session, data: LibraryBookCreate, user_id: int) -> LibraryBook:
    book = LibraryBook(
        title=data.title,
        author=data.author,
        total_chapters=data.total_chapters,
        cover_url=data.cover_url,
        synopsis=data.synopsis,
        category_id=data.category_id,
        added_by_user_id=user_id,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


def update(db: Session, book: LibraryBook, **fields) -> LibraryBook:
    for key, value in fields.items():
        if hasattr(book, key):
            setattr(book, key, value)
    book.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(book)
    return book
