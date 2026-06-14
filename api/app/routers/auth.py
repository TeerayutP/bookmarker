from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..crud import user as crud
from ..schemas.auth import RegisterRequest, LoginRequest, Token, UserOut
from ..core.security import create_access_token, get_current_user
from ..models.user import User
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if crud.get_by_username(db, data.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    if crud.get_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create(db, data.username, data.email, data.password)

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate(db, data.username, data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return Token(access_token=create_access_token(user.id))

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
