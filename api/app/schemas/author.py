from datetime import datetime
from pydantic import BaseModel

class AuthorCreate(BaseModel):
    name: str
    bio: str | None = None

class AuthorUpdate(BaseModel):
    name: str | None = None
    bio: str | None = None

class AuthorOut(BaseModel):
    id: int
    name: str
    bio: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
