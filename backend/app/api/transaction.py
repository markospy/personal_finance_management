from datetime import datetime, timezone
from math import ceil
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Security
from fastapi.responses import JSONResponse
from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.orm import Session

from ..db.dependencie import get_db
from ..models.models import Account, BudgetsSavings, Category, Transaction
from ..schemas.schemas import (
    Scopes,
    TransactionIn,
    TransactionOut,
    TransactionType,
    TransactionUpdate,
    UserOut,
)
from .oauth import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(
    transaction: TransactionIn,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    strict: Annotated[bool, Cookie()] = False,
):
    """Create a transaction."""
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

    if not transaction.comments:
        transaction.comments = category.name

    # Asegurarse de que transaction.date tenga información de zona horaria
    if transaction.date.tzinfo is None:
        transaction.date = transaction.date.replace(tzinfo=timezone.utc)

    transaction = Transaction(**transaction.model_dump())
    db.add(transaction)

    if category.type == TransactionType.EXPENSE.value:
        balance = account.balance - transaction.amount
        if balance < 0:
            raise HTTPException(status_code=400, detail="Insufficient funds")
        account.balance = balance

        # Obtener el presupuesto con id de categoría 0 si existe
        bs_global = db.scalar(
            select(BudgetsSavings).where(BudgetsSavings.user_id == current_user.id, BudgetsSavings.category_id == 0)
        )

        # Obtener el presupuesto con id de categoría definida si es diferente de 0
        bs_category = None
        if transaction.category_id != 0:
            bs_category = db.scalar(
                select(BudgetsSavings).where(
                    BudgetsSavings.user_id == current_user.id, BudgetsSavings.category_id == transaction.category_id
                )
            )

        # Verificar si la transacción está dentro del período del presupuesto global
        if bs_global:
            start_date_global = datetime.strptime(bs_global.period["start_date"], "%Y-%m-%d %H:%M:%S.%f%z")
            end_date_global = datetime.strptime(bs_global.period["end_date"], "%Y-%m-%d %H:%M:%S.%f%z")
            if start_date_global <= transaction.date <= end_date_global:
                total_expenses_global = (
                    db.scalar(
                        select(func.sum(Transaction.amount))
                        .join(Account)
                        .where(
                            Transaction.date >= bs_global.period["start_date"],
                            Transaction.date <= bs_global.period["end_date"],
                            Account.user_id == current_user.id,
                        )
                    )
                    or 0
                )
                new_total_expenses_global = total_expenses_global + transaction.amount
                if new_total_expenses_global > bs_global.amount and strict:
                    return JSONResponse(
                        content={
                            "warning": f"Transacción cancelada. El gasto total global supera el presupuesto proyectado de {bs_global.amount}.",
                        },
                        status_code=409,
                    )

        # Verificar si la transacción está dentro del período del presupuesto de la categoría
        if bs_category:
            start_date_category = datetime.strptime(bs_category.period["start_date"], "%Y-%m-%d %H:%M:%S.%f%z")
            end_date_category = datetime.strptime(bs_category.period["end_date"], "%Y-%m-%d %H:%M:%S.%f%z")
            if start_date_category <= transaction.date <= end_date_category:
                total_expenses_category = (
                    db.scalar(
                        select(func.sum(Transaction.amount))
                        .join(Account)
                        .where(
                            Transaction.category_id == transaction.category_id,
                            Transaction.date >= bs_category.period["start_date"],
                            Transaction.date <= bs_category.period["end_date"],
                            Account.user_id == current_user.id,
                        )
                    )
                    or 0
                )
                new_total_expenses_category = total_expenses_category + transaction.amount
                if new_total_expenses_category > bs_category.amount and strict:
                    return JSONResponse(
                        content={
                            "warning": f"Transacción cancelada. El gasto total para la categoría '{category.name}' supera el presupuesto proyectado de {bs_category.amount}.",
                        },
                        status_code=409,
                    )

    else:
        account.balance += transaction.amount

    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    """Get a specific transaction."""
    transaction = db.scalar(
        select(Transaction).where(Transaction.id == transaction_id, Account.user_id == current_user.id)
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.get("/by-account/{account_id}", response_model=list[TransactionOut])
def get_transactions_by_account(
    account_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    """Gets all transactions from a money account."""
    account = db.scalar(select(Account).where(Account.id == account_id, Account.user_id == current_user.id))
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    transactions = db.scalars(select(Transaction).join(Account).where(Transaction.account_id == account_id)).all()
    return transactions


@router.get("/")
def get_transactions(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    page: int = 0,
    size_page: int = 10,
):
    """Get all transactions."""
    accounts = db.scalars(select(Account).where(Account.user_id == current_user.id)).all()
    transactions_list = []
    total_transactions = 0
    for account in accounts:
        total_transactions += len(db.scalars(select(Transaction).where(Transaction.account_id == account.id)).all())
        transactions = db.scalars(select(Transaction).where(Transaction.account_id == account.id)).all()
        for translation in transactions:
            transactions_list.append(translation)
    if not transactions_list:
        raise HTTPException(status_code=404, detail="Transactions not found")
    # Calcular el total de páginas
    total_pages = ceil(total_transactions / size_page)
    # Asegurarse de que la página solicitada no exceda el total de páginas
    if page > total_pages:
        page = total_pages
    if page < 1:
        page = 1
    # Calcular el índice de inicio y fin para la paginación
    init = (page - 1) * size_page
    end = init + size_page
    # Invertir la lista de transacciones para empezar a mostrarlas desde la mas reciente
    transactions_list.reverse()
    # Obtener los items para la página actual
    paginated_items = transactions_list[init:end]

    pageContent = {
        "totalTransactions": total_transactions,
        "totalPages": total_pages,
        "pageCurrent": page,
        "sizePage": size_page,
        "transactions": paginated_items,
    }
    return pageContent


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    """Updates a transaction. It is only updated if it is the last transaction carried out."""
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
    if transaction.category_id:
        category = db.scalar(
            select(Category).where(
                and_(
                    Category.id == transaction.category_id,
                    or_(Category.is_global, Category.user_id == current_user.id),
                )
            )
        )
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        category_of_transaction_existing = db.scalar(
            select(Category).where(
                and_(
                    Category.id == transaction_existing.category_id,
                    or_(Category.is_global, Category.user_id == current_user.id),
                )
            )
        )
        # Comprobar si el tipo de las categorías han cambiado:
        if category.type != category_of_transaction_existing.type:
            if category_of_transaction_existing.type == TransactionType.EXPENSE.value:
                amount = account.balance + transaction_existing.amount
                if transaction.amount:
                    account.balance = amount + transaction.amount
                else:
                    account.balance = amount + transaction_existing.amount
            else:
                amount = account.balance - transaction_existing.amount
                if transaction.amount:
                    account.balance = amount - transaction.amount
                else:
                    account.balance = amount - transaction_existing.amount
        else:
            if category_of_transaction_existing.type == TransactionType.EXPENSE.value:
                amount = account.balance + transaction_existing.amount
                if transaction.amount:
                    account.balance = amount - transaction.amount
            else:
                amount = account.balance - transaction_existing.amount
                if transaction.amount:
                    account.balance = amount + transaction.amount

    # Actualizar la transacción
    if transaction.category_id:
        last_transaction.category_id = transaction.category_id
    if transaction.amount:
        last_transaction.amount = transaction.amount
    if transaction.date:
        last_transaction.date = transaction.date
    if transaction.comments:
        last_transaction.comments = transaction.comments

    db.commit()
    return last_transaction


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    """Delete a transaction. It is only deleted if it is the last transaction made."""
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
