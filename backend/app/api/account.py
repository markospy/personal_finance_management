from typing import Annotated

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
    """
    Create a new account.
    """
    account_db = db.scalar(
        select(AccountModel).where(AccountModel.name == account.name, AccountModel.user_id == current_user.id)
    )
    if account_db:
        raise HTTPException(status_code=409, detail="Account is already exists")

    account = AccountModel(**account.model_dump(), user_id=current_user.id)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("/", response_model=list[AccountOut])
def get_accounts(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    """
    Gets data from all existing accounts.
    """
    accounts = db.scalars(select(AccountModel).where(AccountModel.user_id == current_user.id)).all()
    if not accounts:
        raise HTTPException(status_code=404, detail="Accounts not found")
    return accounts


@router.get("/{account_id}", response_model=AccountOut)
def get_account(
    account_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    """
    Gets the data of a specific account.
    """
    account = db.scalar(
        select(AccountModel).where(AccountModel.id == account_id, AccountModel.user_id == current_user.id)
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.put("/{account_id}", response_model=AccountOut)
def update_account(
    update_data_account: AccountIn,
    account_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    """
    Update the data of a specific account.
    """
    account = db.scalar(
        select(AccountModel).where(AccountModel.id == account_id, AccountModel.user_id == current_user.id)
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if update_data_account.name is not None:
        account.name = update_data_account.name
    if update_data_account.currency is not None:
        account.currency = update_data_account.currency
    if update_data_account.balance is not None:
        account.balance = update_data_account.balance
    db.commit()
    return account


@router.delete("/{account_id}", status_code=204)
def delete_account(
    account_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    """
    Delete a specific account.
    """
    account = db.scalar(
        select(AccountModel).where(AccountModel.id == account_id, AccountModel.user_id == current_user.id)
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()
