import enum
from datetime import datetime
from sqlalchemy import String, Integer, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base

class BookStatus(str, enum.Enum):
    reading = "reading"
    completed = "completed"
    on_hold = "on_hold"
    dropped = "dropped"

class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    author: Mapped[str] = mapped_column(String(255), nullable=False)
    total_chapters: Mapped[int | None] = mapped_column(Integer, nullable=True)
    current_chapter: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[BookStatus] = mapped_column(Enum(BookStatus), default=BookStatus.reading, nullable=False)
    cover_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    category: Mapped["Category | None"] = relationship("Category")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
