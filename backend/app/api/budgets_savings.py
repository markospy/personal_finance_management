from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db.dependencie import get_db
from ..models.models import Account, BudgetsSavings, Category, Transaction
from ..schemas.schemas import (
    BudgetsSavingsIn,
    BudgetsSavingsOut,
    BudgetsSavingsType,
    BudgetsSavingsUpdate,
    Scopes,
    TransactionType,
    UserOut,
)
from .oauth import get_current_user

router = APIRouter(prefix="/budgets-savings", tags=["budgets-savings"])


@router.post("/", response_model=BudgetsSavingsOut, status_code=201)
def create_budget_saving(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    bs: BudgetsSavingsIn,
    db: Session = Depends(get_db),
):
    if bs.category_id != 0:
        category = db.scalar(select(Category).where(Category.id == bs.category_id))
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        if category.type == TransactionType.INCOME and bs.type == BudgetsSavingsType.BUDGET:
            raise HTTPException(status_code=404, detail="Category could not be an income")
        if category.type == TransactionType.EXPENSE and bs.type == BudgetsSavingsType.SAVINGS:
            raise HTTPException(status_code=404, detail="Category could not be an expense")

    db_budget = db.scalar(
        select(BudgetsSavings).where(
            BudgetsSavings.category_id == bs.category_id,
            BudgetsSavings.type == bs.type,
            BudgetsSavings.user_id == current_user.id,
        )
    )
    if db_budget:
        raise HTTPException(status_code=409, detail="The budget or savings is already exists")

    budget_data = bs.model_dump()
    budget_data["period"]["start_date"] = budget_data["period"]["start_date"].strftime("%Y-%m-%d %H:%M:%S")
    budget_data["period"]["end_date"] = budget_data["period"]["end_date"].strftime("%Y-%m-%d %H:%M:%S")

    bs = BudgetsSavings(**budget_data, user_id=current_user.id)
    db.add(bs)
    db.commit()
    db.refresh(bs)
    return bs


@router.get("/", response_model=list[BudgetsSavingsOut])
def get_all_bbudgets_savings(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    db: Session = Depends(get_db),
):
    bs = db.scalars(select(BudgetsSavings).where(BudgetsSavings.user_id == current_user.id)).all()
    if not bs:
        raise HTTPException(status_code=404, detail="Budgets or Savings is not found")

    return bs


@router.get("/{budget_id}", response_model=BudgetsSavingsOut)
def get_one_budget_saving(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    bs_id: int,
    db: Session = Depends(get_db),
):
    bs = db.scalar(select(BudgetsSavings).where(BudgetsSavings.id == bs_id, BudgetsSavings.user_id == current_user.id))
    if not bs:
        raise HTTPException(status_code=404, detail="Budget or Saving is not found")

    return bs


@router.get("/{budget_id}/budget_status/", response_model=dict)
def get_one_budget_status(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    bs_id: int,
    db: Session = Depends(get_db),
):
    bs = db.scalar(
        select(BudgetsSavings).where(
            BudgetsSavings.id == bs_id, BudgetsSavings.type == "budget", BudgetsSavings.user_id == current_user.id
        )
    )
    if not bs:
        raise HTTPException(status_code=404, detail="Budget is not found")

    total_expenses = 0
    if bs.category_id == 0:
        query = (
            select(func.coalesce(func.sum(Transaction.amount), 0))
            .select_from(Transaction)
            .join(Category, Transaction.category_id == Category.id)
            .join(Account, Transaction.account_id == Account.id)
            .where(Category.type == "EXPENSE", Account.user_id == current_user.id)
        )
        total_expenses = db.scalar(query)
    else:
        query = (
            select(func.coalesce(func.sum(Transaction.amount), 0))
            .select_from(Transaction)
            .join(Category, Transaction.category_id == Category.id)
            .join(Account, Transaction.account_id == Account.id)
            .where(
                Category.type == "EXPENSE",
                Account.user_id == current_user.id,
                Transaction.category_id == bs.category_id,
            )
        )
        total_expenses = db.scalar(query)

    # Preparar el estado del presupuesto
    status = {
        "categoryId": bs.category_id,
        "budgetAmount": bs.amount,
        "spentAmount": total_expenses,
        "isExceeded": total_expenses > bs.amount,
        "remainingAmount": bs.amount - total_expenses,
    }

    return status


@router.get("/{saving_id}/saving_status/", response_model=dict)
def get_one_saving_status(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    bs_id: int,
    db: Session = Depends(get_db),
):
    bs = db.scalar(
        select(BudgetsSavings).where(
            BudgetsSavings.id == bs_id, BudgetsSavings.type == "saving", BudgetsSavings.user_id == current_user.id
        )
    )
    if not bs:
        raise HTTPException(status_code=404, detail="Saving is not found")

    total_incomes = 0
    if bs.category_id == 0:
        query = (
            select(func.coalesce(func.sum(Transaction.amount), 0))
            .select_from(Transaction)
            .join(Category, Transaction.category_id == Category.id)
            .join(Account, Transaction.account_id == Account.id)
            .where(Category.type == "INCOME", Account.user_id == current_user.id)
        )
        total_incomes = db.scalar(query)
    else:
        query = (
            select(func.coalesce(func.sum(Transaction.amount), 0))
            .select_from(Transaction)
            .join(Category, Transaction.category_id == Category.id)
            .join(Account, Transaction.account_id == Account.id)
            .where(
                Category.type == "INCOME",
                Account.user_id == current_user.id,
                Transaction.category_id == bs.category_id,
            )
        )
        total_incomes = db.scalar(query)

    # Preparar el estado del presupuesto
    status = {
        "categoryId": bs.category_id,
        "savingAmount": bs.amount,
        "accumulatedAmount": total_incomes,
        "isAchieved": total_incomes > bs.amount,
        "amountMissing": bs.amount - total_incomes,
    }

    return status


@router.put("/{budget_id}", response_model=BudgetsSavingsOut, status_code=201)
def update_one_budget_saving(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    bs_id: int,
    modify_bs: BudgetsSavingsUpdate,
    db: Session = Depends(get_db),
):
    bs = db.scalar(select(BudgetsSavings).where(BudgetsSavings.id == bs_id, BudgetsSavings.user_id == current_user.id))
    if not bs:
        raise HTTPException(status_code=404, detail="Budget or Saving is not found")

    modify_bs_dict = modify_bs.model_dump(exclude_unset=True)
    # Actualiza los atributos del objeto existente
    for key, value in modify_bs_dict.items():
        if key == "period":
            value["start_date"] = str(value["start_date"])
            value["end_date"] = str(value["end_date"])
        setattr(bs, key, value)

    db.commit()
    db.refresh(bs)
    bs.period["start_date"] = str(bs.period["start_date"])
    bs.period["end_date"] = str(bs.period["end_date"])
    return bs


@router.delete("/{bs_id}", status_code=204)
def delete_one_budget_saving(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    bs_id: int,
    db: Session = Depends(get_db),
):
    bs = db.scalar(select(BudgetsSavings).where(BudgetsSavings.id == bs_id, BudgetsSavings.user_id == current_user.id))
    if not bs:
        raise HTTPException(status_code=404, detail="Budget or Saving is not found")

    db.delete(bs)
    db.commit()
