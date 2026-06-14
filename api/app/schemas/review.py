from datetime import datetime
from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    book_id: int
    rating: int = Field(..., ge=1, le=5)
    body: str | None = None

class ReviewUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=5)
    body: str | None = None

class ReviewOut(BaseModel):
    id: int
    book_id: int
    rating: int
    body: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
