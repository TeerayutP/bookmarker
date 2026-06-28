from datetime import date, datetime
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.user_book import UserBook, BookStatus
from ..models.library_book import LibraryBook
from ..models.category import Category
from ..schemas.stats import StatsOut, MonthCount, CategoryCount

router = APIRouter(prefix="/stats", tags=["stats"], dependencies=[Depends(get_current_user)])


def _month_offset(d: date, months: int) -> date:
    month = d.month - months
    year = d.year + (month - 1) // 12
    month = (month - 1) % 12 + 1
    return d.replace(year=year, month=month, day=1)


@router.get("", response_model=StatsOut)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    uid = current_user.id

    total = db.query(func.count(UserBook.id)).filter(UserBook.user_id == uid).scalar() or 0

    status_rows = (
        db.query(UserBook.status, func.count(UserBook.id))
        .filter(UserBook.user_id == uid)
        .group_by(UserBook.status)
        .all()
    )
    by_status = {s.value: 0 for s in BookStatus}
    for status, count in status_rows:
        by_status[status.value] = count

    month_rows = (
        db.query(
            func.date_format(UserBook.added_at, "%Y-%m").label("month"),
            func.count(UserBook.id).label("count"),
        )
        .filter(UserBook.user_id == uid)
        .group_by("month")
        .all()
    )
    month_map = {row.month: row.count for row in month_rows}

    today = date.today()
    books_per_month = [
        MonthCount(
            month=_month_offset(today, i).strftime("%Y-%m"),
            count=month_map.get(_month_offset(today, i).strftime("%Y-%m"), 0),
        )
        for i in range(5, -1, -1)
    ]

    avg_chapters = (
        db.query(func.avg(LibraryBook.total_chapters))
        .join(UserBook, UserBook.book_id == LibraryBook.id)
        .filter(UserBook.user_id == uid, LibraryBook.total_chapters.isnot(None))
        .scalar()
    )
    if avg_chapters is not None:
        avg_chapters = float(avg_chapters)

    top_categories = (
        db.query(Category.name, func.count(UserBook.id).label("count"))
        .join(LibraryBook, LibraryBook.category_id == Category.id)
        .join(UserBook, UserBook.book_id == LibraryBook.id)
        .filter(UserBook.user_id == uid)
        .group_by(Category.id, Category.name)
        .order_by(func.count(UserBook.id).desc())
        .limit(5)
        .all()
    )

    current_year = datetime.utcnow().year
    completed_this_year = (
        db.query(func.count(UserBook.id))
        .filter(
            UserBook.user_id == uid,
            UserBook.status == BookStatus.completed,
            func.year(UserBook.added_at) == current_year,
        )
        .scalar()
        or 0
    )

    return StatsOut(
        total=total,
        by_status=by_status,
        books_per_month=books_per_month,
        avg_chapters=avg_chapters,
        top_categories=[CategoryCount(name=name, count=count) for name, count in top_categories],
        completed_this_year=completed_this_year,
    )
