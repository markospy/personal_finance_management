from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db.dependencie import get_db
from ..models.models import Account as AccountModel
from ..schemas.schemas import AccountIn, AccountOut, Scopes, UserOut
from .oauth import get_current_user

router = APIRouter(prefix="/accounts", tags=["account"])


@router.post("/", response_model=AccountOut, status_code=201)
def create_account(
    account: AccountIn,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    db.add(AccountModel(**account.model_dump(), user_id=current_user.id))
    db.commit()
    stmt = select(AccountModel).order_by(AccountModel.id.desc())
    created_account = db.scalar(stmt)
    return created_account


@router.get("/", response_model=List[AccountOut])
def get_accounts(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    stmt = select(AccountModel).where(AccountModel.user_id == current_user.id, AccountModel.user_id == current_user.id)
    accounts = db.scalars(stmt).all()
    if not accounts:
        raise HTTPException(status_code=404, detail="Accounts not found")
    return accounts


@router.get("/{account_id}", response_model=AccountOut)
def get_account(
    account_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    stmt = select(AccountModel).where(AccountModel.id == account_id, AccountModel.user_id == current_user.id)
    account = db.scalar(stmt)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.delete("/{account_id}", status_code=204)
def delete_account(
    account_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    stmt = select(AccountModel).where(AccountModel.id == account_id, AccountModel.user_id == current_user.id)
    account = db.scalar(stmt)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()
