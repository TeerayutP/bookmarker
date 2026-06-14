from datetime import datetime
from pydantic import BaseModel
from ..models.book import BookStatus

class BookCreate(BaseModel):
    title: str
    author: str
    total_chapters: int | None = None
    current_chapter: int = 0
    status: BookStatus = BookStatus.reading
    cover_url: str | None = None
    notes: str | None = None
    synopsis: str | None = None
    category_id: int | None = None
    category_name: str | None = None

class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    total_chapters: int | None = None
    current_chapter: int | None = None
    status: BookStatus | None = None
    cover_url: str | None = None
    notes: str | None = None
    synopsis: str | None = None
    category_id: int | None = None
    category_name: str | None = None

class ChapterPatch(BaseModel):
    current_chapter: int

class BookOut(BaseModel):
    id: int
    title: str
    author: str
    total_chapters: int | None
    current_chapter: int
    status: BookStatus
    cover_url: str | None
    notes: str | None
    synopsis: str | None
    category_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
