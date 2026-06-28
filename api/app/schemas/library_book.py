from datetime import datetime
from pydantic import BaseModel


class LibraryBookCreate(BaseModel):
    title: str
    author: str
    total_chapters: int | None = None
    cover_url: str | None = None
    synopsis: str | None = None
    category_id: int | None = None
    category_name: str | None = None


class LibraryBookOut(BaseModel):
    id: int
    title: str
    author: str
    total_chapters: int | None
    cover_url: str | None
    synopsis: str | None
    category_id: int | None
    added_by_user_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
