from datetime import datetime
from pydantic import BaseModel, model_validator
from ..models.user_book import BookStatus


class UserBookCreate(BaseModel):
    # Dual-path: provide book_id to add existing library book, omit to create new
    book_id: int | None = None
    # Library fields (used when book_id is not provided)
    title: str | None = None
    author: str | None = None
    total_chapters: int | None = None
    cover_url: str | None = None
    synopsis: str | None = None
    category_id: int | None = None
    category_name: str | None = None
    # User reading-list fields
    current_chapter: int = 0
    status: BookStatus = BookStatus.reading
    notes: str | None = None
    rating: int | None = None


class UserBookUpdate(BaseModel):
    # Library fields (updates the shared library entry)
    title: str | None = None
    author: str | None = None
    total_chapters: int | None = None
    cover_url: str | None = None
    synopsis: str | None = None
    category_id: int | None = None
    category_name: str | None = None
    # User reading-list fields
    current_chapter: int | None = None
    status: BookStatus | None = None
    notes: str | None = None
    rating: int | None = None


class ChapterPatch(BaseModel):
    current_chapter: int


class UserBookOut(BaseModel):
    id: int           # user_books.id
    book_id: int      # library_books.id
    title: str
    author: str
    total_chapters: int | None
    cover_url: str | None
    synopsis: str | None
    category_id: int | None
    current_chapter: int
    status: BookStatus
    notes: str | None
    rating: int | None
    added_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode='before')
    @classmethod
    def flatten_library_book(cls, v):
        if hasattr(v, 'book') and v.book is not None:
            return {
                'id': v.id,
                'book_id': v.book_id,
                'title': v.book.title,
                'author': v.book.author,
                'total_chapters': v.book.total_chapters,
                'cover_url': v.book.cover_url,
                'synopsis': v.book.synopsis,
                'category_id': v.book.category_id,
                'current_chapter': v.current_chapter,
                'status': v.status,
                'notes': v.notes,
                'rating': v.rating,
                'added_at': v.added_at,
                'updated_at': v.updated_at,
            }
        return v
