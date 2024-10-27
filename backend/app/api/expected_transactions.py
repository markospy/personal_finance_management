from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..api.oauth import get_current_user
from ..db.dependencie import get_db
from ..models.models import ExpectedTransaction
from ..schemas.schemas import (
    ExpectedTransactionIn,
    ExpectedTransactionOut,
    Scopes,
    UserOut,
)

router = APIRouter(prefix="/expected_transactions", tags=["expected transaction"])


@router.post("/", response_model=ExpectedTransactionOut, status_code=201)
def create_expected_transaction(
    expected_transaction: ExpectedTransactionIn,
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    db: Session = Depends(get_db),
):
    expected_transactions = db.scalars(
        select(ExpectedTransaction).where(
            ExpectedTransaction.user_id == current_user.id,
            ExpectedTransaction.category_id == expected_transaction.category_id,
        )
    ).all()
    if expected_transactions:
        raise HTTPException(status_code=400, detail="Expected transaction already exists")

    db_expected_transaction = ExpectedTransaction(**expected_transaction.model_dump(), user_id=current_user.id)
    db.add(db_expected_transaction)
    db.commit()
    db.refresh(db_expected_transaction)
    return db_expected_transaction


@router.get("/", response_model=list[ExpectedTransactionOut])
def get_expected_transactions(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    db: Session = Depends(get_db),
):
    expected_transactions = db.scalars(
        select(ExpectedTransaction).where(ExpectedTransaction.user_id == current_user.id)
    ).all()
    if not expected_transactions:
        raise HTTPException(status_code=404, detail="Expected transactions not found")
    return expected_transactions


@router.get("/{expected_transaction_id}", response_model=ExpectedTransactionOut)
def get_expected_transaction(
    expected_transaction_id: int,
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    db: Session = Depends(get_db),
):
    expected_transaction = db.scalar(
        select(ExpectedTransaction).where(
            ExpectedTransaction.id == expected_transaction_id, ExpectedTransaction.user_id == current_user.id
        )
    )
    if not expected_transaction:
        raise HTTPException(status_code=404, detail="Expected transaction not found")
    return expected_transaction


@router.put("/{expected_transaction_id}", response_model=ExpectedTransactionOut)
def update_expected_transaction(
    expected_transaction_id: int,
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    expected_transaction: ExpectedTransactionIn,
    db: Session = Depends(get_db),
):
    db_expected_transaction = db.scalar(
        select(ExpectedTransaction).where(
            ExpectedTransaction.user_id == current_user.id,
            ExpectedTransaction.id == expected_transaction_id,
        )
    )
    if not db_expected_transaction:
        raise HTTPException(status_code=404, detail="Expected transaction not found")

    for key, value in expected_transaction.model_dump().items():
        setattr(db_expected_transaction, key, value)

    db.commit()
    db.refresh(db_expected_transaction)
    return db_expected_transaction


@router.delete("/{expected_transaction_id}", status_code=204)
def delete_expected_transaction(
    expected_transaction_id: int,
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    db: Session = Depends(get_db),
):
    db_expected_transaction = db.scalar(
        select(ExpectedTransaction).where(
            ExpectedTransaction.user_id == current_user.id,
            ExpectedTransaction.id == expected_transaction_id,
        )
    )
    if db_expected_transaction is None:
        raise HTTPException(status_code=404, detail="Expected transaction not found")

    db.delete(db_expected_transaction)
    db.commit()
