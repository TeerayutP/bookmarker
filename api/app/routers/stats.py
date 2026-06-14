from datetime import date, datetime
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..core.security import get_current_user
from ..models.book import Book, BookStatus
from ..models.category import Category
from ..schemas.stats import StatsOut, MonthCount, CategoryCount

router = APIRouter(prefix="/stats", tags=["stats"], dependencies=[Depends(get_current_user)])


def _month_offset(d: date, months: int) -> date:
    month = d.month - months
    year = d.year + (month - 1) // 12
    month = (month - 1) % 12 + 1
    return d.replace(year=year, month=month, day=1)


@router.get("", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Book.id)).scalar() or 0

    status_rows = (
        db.query(Book.status, func.count(Book.id))
        .group_by(Book.status)
        .all()
    )
    by_status = {s.value: 0 for s in BookStatus}
    for status, count in status_rows:
        by_status[status.value] = count

    month_rows = (
        db.query(
            func.date_format(Book.created_at, "%Y-%m").label("month"),
            func.count(Book.id).label("count"),
        )
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

    avg_chapters = db.query(func.avg(Book.total_chapters)).filter(Book.total_chapters.isnot(None)).scalar()
    if avg_chapters is not None:
        avg_chapters = float(avg_chapters)

    top_categories = (
        db.query(Category.name, func.count(Book.id).label("count"))
        .join(Book, Book.category_id == Category.id)
        .group_by(Category.id, Category.name)
        .order_by(func.count(Book.id).desc())
        .limit(5)
        .all()
    )

    current_year = datetime.utcnow().year
    completed_this_year = (
        db.query(func.count(Book.id))
        .filter(
            Book.status == BookStatus.completed,
            func.year(Book.created_at) == current_year,
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
