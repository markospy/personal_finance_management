from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db.dependencie import get_db
from ..models.models import Account as AccountModel
from ..schemas.schemas import AccountIn, AccountOut, UserOut
from .oauth import get_current_user

router = APIRouter(prefix="/accounts", tags=["account"])


@router.post("/", response_model=AccountOut, status_code=201)
def create_account(
    account: AccountIn, db: Session = Depends(get_db), current_user: UserOut = Depends(get_current_user)
):
    new_account = account.model_dump()
    db.add(AccountModel(**new_account, user_id=current_user.id))
    db.commit()
    stmt = select(AccountModel).order_by(AccountModel.id.desc())
    created_account = db.scalar(stmt)
    return created_account


@router.get("/", response_model=List[AccountOut])
def get_accounts(db: Session = Depends(get_db), current_user: UserOut = Depends(get_current_user)):
    stmt = select(AccountModel).where(AccountModel.user_id == current_user.id, AccountModel.user_id == current_user.id)
    accounts = db.scalars(stmt)
    print("Accounts")
    accounts_list = []
    for account in accounts:
        accounts_list.append(account)
    if not accounts_list:
        raise HTTPException(status_code=404, detail="Accounts not found")
    return accounts_list


@router.get("/{account_id}", response_model=AccountOut)
def get_account(account_id: int, db: Session = Depends(get_db), current_user: UserOut = Depends(get_current_user)):
    stmt = select(AccountModel).where(AccountModel.id == account_id, AccountModel.user_id == current_user.id)
    account = db.scalar(stmt)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, db: Session = Depends(get_db), current_user: UserOut = Depends(get_current_user)):
    stmt = select(AccountModel).where(AccountModel.id == account_id, AccountModel.user_id == current_user.id)
    account = db.scalar(stmt)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()
