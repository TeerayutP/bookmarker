from pydantic import BaseModel


class MonthCount(BaseModel):
    month: str
    count: int


class CategoryCount(BaseModel):
    name: str
    count: int


class StatsOut(BaseModel):
    total: int
    by_status: dict[str, int]
    books_per_month: list[MonthCount]
    avg_chapters: float | None
    top_categories: list[CategoryCount]
    completed_this_year: int
