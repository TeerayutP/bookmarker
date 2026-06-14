from sqlalchemy.orm import Session
from ..models.author import Author
from ..schemas.author import AuthorCreate, AuthorUpdate

def find_or_create(db: Session, name: str) -> Author:
    existing = db.query(Author).filter(Author.name.ilike(name)).first()
    if existing:
        return existing
    return create(db, AuthorCreate(name=name, bio=None))

def get_all(db: Session) -> list[Author]:
    return db.query(Author).order_by(Author.name).all()

def get(db: Session, author_id: int) -> Author | None:
    return db.query(Author).filter(Author.id == author_id).first()

def create(db: Session, data: AuthorCreate) -> Author:
    author = Author(**data.model_dump())
    db.add(author)
    db.commit()
    db.refresh(author)
    return author

def update(db: Session, author: Author, data: AuthorUpdate) -> Author:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(author, field, value)
    db.commit()
    db.refresh(author)
    return author

def delete(db: Session, author: Author) -> None:
    db.delete(author)
    db.commit()
