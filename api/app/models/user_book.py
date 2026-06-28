import enum
from datetime import datetime
from sqlalchemy import Integer, Text, Enum, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class BookStatus(str, enum.Enum):
    reading = "reading"
    completed = "completed"
    on_hold = "on_hold"
    dropped = "dropped"


class UserBook(Base):
    __tablename__ = "user_books"
    __table_args__ = (UniqueConstraint("user_id", "book_id", name="uq_user_books"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id: Mapped[int] = mapped_column(Integer, ForeignKey("library_books.id", ondelete="CASCADE"), nullable=False)
    current_chapter: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[BookStatus] = mapped_column(Enum(BookStatus, name="userbookstatus"), default=BookStatus.reading, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    added_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    book: Mapped["LibraryBook"] = relationship("LibraryBook")
    user: Mapped["User"] = relationship("User")
