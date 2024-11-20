from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..api.oauth import get_current_user
from ..db.dependencie import get_db
from ..models.models import Account, Category, Transaction
from ..schemas.schemas import Scopes, TransactionType, UserOut

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/monthly-summary")
async def get_monthly_summary(
    year: int,
    month: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    """
    Obtiene el resumen mensual de gastos e ingresos
    """
    # Verificar que el mes y año sean válidos
    try:
        datetime(year, month, 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid year or month")

    accounts = db.scalars(select(Account).where(Account.user_id == current_user.id)).all()
    if not accounts:
        raise HTTPException(status_code=404, detail="Accounts not found")

    totalExpenses, totalIncomes = 0, 0
    for account in accounts:
        transactions = db.scalars(
            select(Transaction).where(
                Transaction.account_id == account.id,
                func.extract("year", Transaction.date) == year,
                func.extract("month", Transaction.date) == month,
            )
        ).all()

        for transaction in transactions:
            category = db.scalar(select(Category).where(Category.id == transaction.category_id))

            if category.type == TransactionType.EXPENSE.value:
                totalExpenses += transaction.amount
            else:
                totalIncomes += transaction.amount

    if not (totalExpenses and totalIncomes):
        raise HTTPException(status_code=404, detail="Transactions not found")

    return {"totalExpenses": float(totalExpenses), "totalIncomes": float(totalIncomes)}


@router.get("/expenses-by-category")
async def get_expenses_by_category(
    year: int,
    month: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    """
    Obtiene las categorías ordenadas por total de gastos
    """
    # Verificar que el mes y año sean válidos
    try:
        datetime(year, month, 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid year or month")

    accounts = db.scalars(select(Account).where(Account.user_id == current_user.id)).all()
    if not accounts:
        raise HTTPException(status_code=404, detail="Accounts not found")

    for account in accounts:
        transactions = db.scalars(
            select(Transaction).where(
                Transaction.account_id == account.id,
                func.extract("year", Transaction.date) == year,
                func.extract("month", Transaction.date) == month,
            )
        ).all()

        if not transactions:
            raise HTTPException(status_code=404, detail="Transactions not found")

        expenses_by_category = {}
        for transaction in transactions:
            category = db.scalar(
                select(Category).where(
                    Category.id == transaction.category_id, Category.type == TransactionType.EXPENSE.value
                )
            )
            if category:
                if category.name not in expenses_by_category:
                    expenses_by_category[category.name] = {"id": category.id, "amount": float(transaction.amount)}
                else:
                    expenses_by_category[category.name]["amount"] += float(transaction.amount)

                # Ordenar el diccionario por cantidad (de mayor a menor)
                sorted_expenses = dict(
                    sorted(expenses_by_category.items(), key=lambda item: item[1]["amount"], reverse=True)
                )

        return [
            {"categoryId": value["id"], "categoryName": cat, "totalAmount": value["amount"]}
            for cat, value in sorted_expenses.items()
        ]


@router.get("/incomes-by-category")
async def get_incomes_by_category(
    year: int,
    month: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
):
    """
    Obtiene las categorías ordenadas por total de gastos
    """
    # Verificar que el mes y año sean válidos
    try:
        datetime(year, month, 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid year or month")

    accounts = db.scalars(select(Account).where(Account.user_id == current_user.id)).all()
    if not accounts:
        raise HTTPException(status_code=404, detail="Accounts not found")

    for account in accounts:
        transactions = db.scalars(
            select(Transaction).where(
                Transaction.account_id == account.id,
                func.extract("year", Transaction.date) == year,
                func.extract("month", Transaction.date) == month,
            )
        ).all()

        if not transactions:
            raise HTTPException(status_code=404, detail="Transactions not found")

        incomes_by_category = {}
        for transaction in transactions:
            category = db.scalar(
                select(Category).where(
                    Category.id == transaction.category_id, Category.type == TransactionType.INCOME.value
                )
            )
            if category:
                if category.name not in incomes_by_category:
                    incomes_by_category[category.name] = {"id": category.id, "amount": float(transaction.amount)}
                else:
                    incomes_by_category[category.name]["amount"] += float(transaction.amount)

                # Ordenar el diccionario por cantidad (de mayor a menor)
                sorted_incomes = dict(
                    sorted(incomes_by_category.items(), key=lambda item: item[1]["amount"], reverse=True)
                )

        return [
            {"categoryId": value["id"], "categoryName": cat, "totalAmount": value["amount"]}
            for cat, value in sorted_incomes.items()
        ]
