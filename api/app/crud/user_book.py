from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from ..models.user_book import UserBook, BookStatus
from ..models.library_book import LibraryBook
from ..schemas.user_book import UserBookCreate, UserBookUpdate
from . import library as library_crud
from ..schemas.library_book import LibraryBookCreate

_SORT_MAP = {
    "title_asc": None,        # handled below (join needed)
    "title_desc": None,
    "updated_at_desc": UserBook.updated_at.desc(),
    "updated_at_asc": UserBook.updated_at.asc(),
    "added_at_desc": UserBook.added_at.desc(),
}


def _base_query(db: Session, user_id: int):
    return (
        db.query(UserBook)
        .options(joinedload(UserBook.book))
        .filter(UserBook.user_id == user_id)
    )


def get_all_for_user(
    db: Session,
    user_id: int,
    status: BookStatus | None = None,
    skip: int = 0,
    limit: int = 20,
    sort: str = "updated_at_desc",
) -> list[UserBook]:
    q = _base_query(db, user_id)
    if status:
        q = q.filter(UserBook.status == status)

    if sort in ("title_asc", "title_desc"):
        q = q.join(LibraryBook, UserBook.book_id == LibraryBook.id)
        order = LibraryBook.title.asc() if sort == "title_asc" else LibraryBook.title.desc()
    else:
        order = _SORT_MAP.get(sort, UserBook.updated_at.desc())

    return q.order_by(order).offset(skip).limit(limit).all()


def get_for_user(db: Session, user_id: int, user_book_id: int) -> UserBook | None:
    return (
        _base_query(db, user_id)
        .filter(UserBook.id == user_book_id)
        .first()
    )


def get_by_book_for_user(db: Session, user_id: int, book_id: int) -> UserBook | None:
    return (
        _base_query(db, user_id)
        .filter(UserBook.book_id == book_id)
        .first()
    )


def create(
    db: Session,
    user_id: int,
    data: UserBookCreate,
    category_crud=None,
    author_crud=None,
) -> UserBook:
    if data.book_id:
        lib_book_id = data.book_id
    else:
        # Resolve category if provided by name
        cat_id = data.category_id
        if data.category_name and not cat_id and category_crud:
            cat = category_crud.find_or_create(db, data.category_name)
            cat_id = cat.id
        if author_crud and data.author:
            author_crud.find_or_create(db, data.author)
        lib_book = library_crud.create(
            db,
            LibraryBookCreate(
                title=data.title,
                author=data.author,
                total_chapters=data.total_chapters,
                cover_url=data.cover_url,
                synopsis=data.synopsis,
                category_id=cat_id,
            ),
            user_id=user_id,
        )
        lib_book_id = lib_book.id

    ub = UserBook(
        user_id=user_id,
        book_id=lib_book_id,
        current_chapter=data.current_chapter,
        status=data.status,
        notes=data.notes,
        rating=data.rating,
    )
    db.add(ub)
    db.commit()
    db.refresh(ub)
    # Re-query with joinedload so the response has the book relationship loaded
    return get_for_user(db, user_id, ub.id)


def update(
    db: Session,
    ub: UserBook,
    data: UserBookUpdate,
    category_crud=None,
    author_crud=None,
) -> UserBook:
    # Update library book fields
    lib_fields = {}
    if data.title is not None:
        lib_fields['title'] = data.title
    if data.author is not None:
        lib_fields['author'] = data.author
        if author_crud:
            author_crud.find_or_create(db, data.author)
    if data.total_chapters is not None:
        lib_fields['total_chapters'] = data.total_chapters
    if data.cover_url is not None:
        lib_fields['cover_url'] = data.cover_url
    if data.synopsis is not None:
        lib_fields['synopsis'] = data.synopsis
    if data.category_id is not None:
        lib_fields['category_id'] = data.category_id
    if data.category_name is not None and data.category_id is None and category_crud:
        cat = category_crud.find_or_create(db, data.category_name)
        lib_fields['category_id'] = cat.id

    if lib_fields:
        library_crud.update(db, ub.book, **lib_fields)

    # Update user book fields
    if data.current_chapter is not None:
        ub.current_chapter = data.current_chapter
    if data.status is not None:
        ub.status = data.status
    if data.notes is not None:
        ub.notes = data.notes
    if data.rating is not None:
        ub.rating = data.rating

    ub.updated_at = datetime.utcnow()
    db.commit()

    return get_for_user(db, ub.user_id, ub.id)


def patch_chapter(db: Session, ub: UserBook, chapter: int) -> UserBook:
    ub.current_chapter = chapter
    ub.updated_at = datetime.utcnow()
    db.commit()
    return get_for_user(db, ub.user_id, ub.id)


def delete(db: Session, ub: UserBook) -> None:
    db.delete(ub)
    db.commit()
