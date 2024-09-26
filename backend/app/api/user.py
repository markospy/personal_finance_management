from typing import Annotated

from fastapi import Depends, HTTPException, Security
from fastapi.routing import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db.dependencie import get_db
from ..models.models import User
from ..schemas.schemas import Scopes, UserIn, UserOut
from .oauth import get_current_user, get_password_hash

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/", status_code=201, response_model=UserOut)
def create_user(user: UserIn, db: Session = Depends(get_db)):
    db_user = db.scalar(select(User).where(User.name == user.name))
    if db_user and db_user.__dict__["name"] == user.name:
        raise HTTPException(status_code=409, detail="The user's name is already being used by another user")
    new_user = user.model_dump(exclude_none=True)
    new_user["password"] = get_password_hash(new_user["password"])
    db.add(User(**new_user))
    db.commit()
    created_user = db.scalar(select(User).order_by(User.id.desc()))
    return created_user


@router.get("/me")
def get_me(current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])]):
    return UserOut(**current_user.model_dump())


@router.delete("/me", status_code=204)
def delete_me(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    db_user = db.scalar(select(User).where(User.id == current_user.id))
    db.delete(db_user)
    db.commit()
