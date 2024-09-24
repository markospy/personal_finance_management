from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db.dependencie import get_db
from ..models.models import User
from ..schemas.schemas import UserIn, UserOut
from .oauth import get_current_user, get_password_hash

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/", status_code=201, response_model=UserOut)
def create_user(user: UserIn, db: Session = Depends(get_db)):
    stmt = select(User).where(User.name == user.name)
    database_user = db.scalar(stmt)
    if database_user and database_user.__dict__["name"] == user.name:
        raise HTTPException(status_code=409, detail="The user's name is already being used by another user")
    new_user = user.model_dump(exclude_none=True)
    new_user["password"] = get_password_hash(new_user["password"])
    db.add(User(**new_user))
    db.commit()
    stmt = select(User).order_by(User.id.desc())
    created_user = db.scalar(stmt)
    return created_user


@router.get("/me")
def get_me(current_user: Annotated[UserOut, Depends(get_current_user)]):
    return UserOut(**current_user.model_dump())


@router.delete("/me", status_code=204)
def delete_me(db: Annotated[Session, Depends(get_db)], current_user: Annotated[UserOut, Depends(get_current_user)]):
    stmt = select(User).where(User.id == current_user.id)
    user = db.scalar(stmt)
    db.delete(user)
    db.commit()
