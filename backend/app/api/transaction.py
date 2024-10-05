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
        db.execute(
            update(Account)
            .where(Account.id == transaction.account_id, Account.user_id == current_user.id)
            .values(balance=account.balance - transaction.amount)
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

    # Todo: Agregar funcionalidad de sumar o restar dinero de la cuenta en funcion de si la transaccion es un ingreso o un gasto.


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


@router.get("/account/{account_id}", response_model=list[TransactionOut])
def get_transactions_by_account(
    account_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    # lógica para obtener transacciones de una cuenta específica
    pass


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    # lógica para eliminar una transacción
    pass
