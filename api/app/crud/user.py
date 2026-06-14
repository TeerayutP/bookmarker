from sqlalchemy.orm import Session
from ..models.user import User
from ..core.security import hash_password, verify_password

def get_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()

def get_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def create(db: Session, username: str, email: str, password: str) -> User:
    user = User(username=username, email=email, hashed_password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate(db: Session, username: str, password: str) -> User | None:
    user = get_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
