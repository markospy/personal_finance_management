from typing import Annotated

import requests
from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.routing import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db.dependencie import get_db
from ..models.models import User
from ..schemas.schemas import UserIn, UserOut
from .oauth import get_current_user, get_password_hash

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/")
def create_user(user: UserIn, db: Session = Depends(get_db)):
    try:
        new_user = user.model_dump(exclude_unset=True)
        new_user["password"] = get_password_hash(new_user["password"])
        db.add(User(**new_user))
        db.commit()
        stmt = select(User).order_by(User.id.desc())
        created_user = db.scalar(stmt)
        user_data = UserOut(**created_user.__dict__).model_dump()
        return JSONResponse(content=user_data, status_code=201)
    except requests.exceptions.HTTPError:
        raise HTTPException(status_code=400, detail="error occured")


@router.get("/me")
def get_user_me(current_user: Annotated[UserOut, Depends(get_current_user)]):
    return UserOut(**current_user.model_dump())