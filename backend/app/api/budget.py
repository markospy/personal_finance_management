from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db.dependencie import get_db
from ..models.models import Account, Budget, Category, Transaction
from ..schemas.schemas import BudgetIn, BudgetOut, BudgetUpdate, Scopes, UserOut
from .oauth import get_current_user

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.post("/", response_model=BudgetOut, status_code=201)
def create_budget(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    budget: BudgetIn,
    db: Session = Depends(get_db),
):
    category = db.scalar(select(Category).where(Category.id == budget.category_id))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    db_budget = db.scalar(
        select(Budget).where(Budget.category_id == budget.category_id, Budget.user_id == current_user.id)
    )
    if db_budget:
        raise HTTPException(status_code=409, detail="The budget is already exists")
    budget_data = budget.model_dump()
    budget_data["period"]["start_date"] = budget_data["period"]["start_date"].strftime("%Y-%m-%d %H:%M:%S")
    budget_data["period"]["end_date"] = budget_data["period"]["end_date"].strftime("%Y-%m-%d %H:%M:%S")

    budget = Budget(**budget_data, user_id=current_user.id)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/", response_model=list[BudgetOut])
def get_all_budgets(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    db: Session = Depends(get_db),
):
    budgets = db.scalars(select(Budget).where(Budget.user_id == current_user.id)).all()
    if not budgets:
        raise HTTPException(status_code=404, detail="Budgets is not found")

    return budgets


@router.get("/{budget_id}", response_model=BudgetOut)
def get_one_budget(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    budget_id: int,
    db: Session = Depends(get_db),
):
    budget = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget is not found")

    return budget


@router.get("/{budget_id}/status/", response_model=dict)
def get_one_budget_status(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    budget_id: int,
    db: Session = Depends(get_db),
):
    budget = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget is not found")

    total_expenses = (
        db.scalar(
            select(func.sum(Transaction.amount))
            .join(Account)
            .where(
                Transaction.category_id == budget.category_id,
                Transaction.date >= budget.period["start_date"],
                Transaction.date <= budget.period["end_date"],
                Account.user_id == current_user.id,
            )
        )
        or 0
    )

    # Preparar el estado del presupuesto
    status = {
        "categoryId": budget.category_id,
        "categoryName": budget.category.name,
        "budgetAmount": budget.amount,
        "spentAmount": total_expenses,
        "isExceeded": total_expenses > budget.amount,
        "remainingAmount": budget.amount - total_expenses,
    }

    return status


@router.put("/{budget_id}", response_model=BudgetOut, status_code=201)
def update_one_budget(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    budget_id: int,
    modify_budget: BudgetUpdate,
    db: Session = Depends(get_db),
):
    budget = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget is not found")

    modify_budget_dict = modify_budget.model_dump(exclude_unset=True)
    # Actualiza los atributos del objeto existente
    for key, value in modify_budget_dict.items():
        if key == "period":
            value["start_date"] = str(value["start_date"])
            value["end_date"] = str(value["end_date"])
        setattr(budget, key, value)

    db.commit()
    db.refresh(budget)
    budget.period["start_date"] = str(budget.period["start_date"])
    budget.period["end_date"] = str(budget.period["end_date"])
    return budget


@router.delete("/{budget_id}", status_code=204)
def delete_one_budget(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    budget_id: int,
    db: Session = Depends(get_db),
):
    budget = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget is not found")

    db.delete(budget)
    db.commit()
