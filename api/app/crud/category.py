from sqlalchemy.orm import Session
from ..models.category import Category
from ..schemas.category import CategoryCreate, CategoryUpdate

def _to_slug(name: str) -> str:
    import re
    return re.sub(r'[^a-z0-9-]', '', name.lower().replace(' ', '-'))

def find_or_create(db: Session, name: str) -> Category:
    existing = db.query(Category).filter(Category.name.ilike(name)).first()
    if existing:
        return existing
    slug = _to_slug(name)
    # ensure slug uniqueness
    base, i = slug, 1
    while db.query(Category).filter(Category.slug == slug).first():
        slug = f"{base}-{i}"; i += 1
    return create(db, CategoryCreate(name=name, slug=slug))

def get_all(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.name).all()

def get(db: Session, category_id: int) -> Category | None:
    return db.query(Category).filter(Category.id == category_id).first()

def get_by_slug(db: Session, slug: str) -> Category | None:
    return db.query(Category).filter(Category.slug == slug).first()

def create(db: Session, data: CategoryCreate) -> Category:
    category = Category(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def update(db: Session, category: Category, data: CategoryUpdate) -> Category:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category

def delete(db: Session, category: Category) -> None:
    db.delete(category)
    db.commit()
