from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from ..db.dependencie import get_db
from ..models.models import Budget, Category
from ..schemas.schemas import BudgetIn, BudgetOut, Scopes, UserOut
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

    db.add(Budget(**budget_data, user_id=current_user.id))
    db.commit()

    new_budget = db.scalar(select(Budget).order_by(Budget.id.desc()))
    return new_budget


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
        raise HTTPException(status_code=404, detail="Budgets is not found")

    return budget


@router.put("/{budget_id}", response_model=BudgetOut, status_code=201)
def update_one_budget(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    budget_id: int,
    modify_budget: BudgetIn,
    db: Session = Depends(get_db),
):
    budget = db.scalars(select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id)).all()
    if not budget:
        raise HTTPException(status_code=404, detail="Budgets is not found")

    modify_budget_dict = modify_budget.model_dump()
    period = {
        "start_date": str(modify_budget_dict["period"]["start_date"]),
        "end_date": str(modify_budget_dict["period"]["end_date"]),
    }

    db.execute(
        update(Budget)
        .where(Budget.id == budget_id, Budget.user_id == current_user.id)
        .values(
            category_id=modify_budget.category_id,
            amount=modify_budget.amount,
            period=period,
        )
    )
    db.commit()

    budget = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budgets is not found")
    return budget


@router.delete("/{budget_id}", status_code=204)
def delete_one_budget(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    budget_id: int,
    db: Session = Depends(get_db),
):
    budget = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id))
    if not budget:
        raise HTTPException(status_code=404, detail="Budgets is not found")

    db.delete(budget)
    db.commit()
