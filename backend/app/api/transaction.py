from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy import and_, or_, select, update
from sqlalchemy.orm import Session

from ..db.dependencie import get_db
from ..models.models import Account, Category, Transaction
from ..schemas.schemas import (
    Scopes,
    TransactionIn,
    TransactionOut,
    TransactionType,
    UserOut,
)
from .oauth import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(
    transaction: TransactionIn,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    category = db.scalar(
        select(Category).where(
            and_(Category.id == transaction.category_id, or_(Category.is_global, Category.user_id == current_user.id))
        )
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    account = db.scalar(
        select(Account).where(Account.id == transaction.account_id, Account.user_id == current_user.id)
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    db.add(Transaction(**transaction.model_dump(), type=category.type))
    if category.type == TransactionType.EXPENSE.value:
        balance = account.balance - transaction.amount
        if balance < 0:
            raise HTTPException(status_code=400, detail="Insufficient funds")
        db.execute(
            update(Account)
            .where(Account.id == transaction.account_id, Account.user_id == current_user.id)
            .values(balance=balance)
        )
    else:
        db.execute(
            update(Account)
            .where(Account.id == transaction.account_id, Account.user_id == current_user.id)
            .values(balance=account.balance + transaction.amount)
        )

    db.commit()
    created_transaction = db.scalar(select(Transaction).order_by(Transaction.id.desc()))
    return created_transaction


@router.get("/", response_model=list[TransactionOut])
def get_transactions(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    accounts = db.scalars(select(Account).where(Account.user_id == current_user.id)).all()
    transactions_list = []
    for account in accounts:
        transactions = db.scalars(select(Transaction).where(Transaction.account_id == account.id)).all()
        for translation in transactions:
            transactions_list.append(translation)
    if not transactions_list:
        raise HTTPException(status_code=404, detail="Transactions not found")
    return transactions_list


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    transaction = db.scalar(
        select(Transaction).where(Transaction.id == transaction_id, Account.user_id == current_user.id)
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.get("/account/{account_id}", response_model=list[TransactionOut])
def get_transactions_by_account(
    account_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    transactions = db.scalars(select(Transaction).join(Account).where(Transaction.account_id == account_id)).all()
    return transactions


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    transaction: TransactionIn,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    transaction_existing = db.scalar(select(Transaction).where(Transaction.id == transaction_id))
    if not transaction_existing:
        raise HTTPException(status_code=404, detail="Transaction not found")

    account = db.scalar(
        select(Account).where(Account.id == transaction.account_id, Account.user_id == current_user.id)
    )
    if not account:
        raise HTTPException(404, detail="Account not found")

    # Verificar si la transacción es la última de la cuenta
    last_transaction = db.scalar(
        select(Transaction).where(Transaction.account_id == transaction.account_id).order_by(Transaction.id.desc())
    )
    if last_transaction.id != transaction_id:
        raise HTTPException(status_code=400, detail="Only the last transaction can be updated")

    # Verificar si la categoría existe y es válida
    category = db.scalar(
        select(Category).where(
            and_(Category.id == transaction.category_id, or_(Category.is_global, Category.user_id == current_user.id))
        )
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Actualizar la transacción
    last_transaction.category_id = transaction.category_id
    last_transaction.amount = transaction.amount
    last_transaction.date = transaction.date
    last_transaction.comments = transaction.comments
    db.execute(
        update(Transaction)
        .where(Account.id == transaction.account_id, Account.user_id == current_user.id)
        .values(
            category_id=transaction.category_id,
            amount=transaction.amount,
            date=transaction.date,
            comments=transaction.comments,
        )
    )

    db.commit()
    return last_transaction


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    transaction = db.scalar(select(Transaction).where(Transaction.id == transaction_id))
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    account = db.scalar(
        select(Account).where(Account.id == transaction.account_id, Account.user_id == current_user.id)
    )
    if not account:
        raise HTTPException(404, detail="Transaction not found")

    # Verificar si la transacción es la última de la cuenta
    last_transaction = db.scalar(
        select(Transaction).where(Transaction.account_id == transaction.account_id).order_by(Transaction.id.desc())
    )
    if last_transaction.id != transaction_id:
        raise HTTPException(status_code=400, detail="Only the last transaction can be deleted")

    category = db.scalar(select(Category).where(Category.id == transaction.category_id))

    db.delete(transaction)

    if category.type == TransactionType.EXPENSE.value:
        db.execute(
            update(Account)
            .where(Account.id == transaction.account_id, Account.user_id == current_user.id)
            .values(balance=account.balance + transaction.amount)
        )
    else:
        db.execute(
            update(Account)
            .where(Account.id == transaction.account_id, Account.user_id == current_user.id)
            .values(balance=account.balance - transaction.amount)
        )
    db.commit()
