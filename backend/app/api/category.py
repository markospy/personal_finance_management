from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from ..api.oauth import get_current_user
from ..db.dependencie import get_db
from ..models.models import Category
from ..schemas.schemas import CategoryIn, CategoryOut, Scopes, UserOut

router = APIRouter(prefix="/categories", tags=["category"])


@router.get("/", response_model=list[CategoryOut])
def get_categories(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    db: Session = Depends(get_db),
):
    categories = db.scalars(select(Category).where(or_(Category.is_global, Category.user_id == current_user.id))).all()
    if not categories:
        raise HTTPException(status_code=404, detail="Category not found")
    return categories


@router.get("/{category_id}", response_model=CategoryOut)
def get_one_category(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    category_id: int,
    db: Session = Depends(get_db),
):

    category = db.scalar(
        select(Category).where(
            and_(Category.id == category_id, or_(Category.is_global, Category.user_id == current_user.id))
        )
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post(
    "/global",
    response_model=CategoryOut,
    status_code=201,
    dependencies=[Security(get_current_user, scopes=[Scopes.ADMIN.value])],
)
def create_category_global(
    category: CategoryIn,
    db: Session = Depends(get_db),
):
    db_category = db.scalar(
        select(Category).where(Category.is_global, Category.name == category.name, Category.type == category.type)
    )
    if db_category:
        raise HTTPException(status_code=409, detail="The category is already exists")
    if category.is_global is False:
        raise HTTPException(status_code=406, detail="This category is not global.")

    category = Category(**category.model_dump(), user_id=None)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.post("/user", response_model=CategoryOut, status_code=201)
def create_category_user(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    category: CategoryIn,
    db: Session = Depends(get_db),
):
    db_category = db.scalar(select(Category).where(Category.name == category.name, Category.type == category.type))
    if db_category:
        raise HTTPException(status_code=409, detail="The category is already exists")
    if category.is_global is True:
        raise HTTPException(status_code=406, detail="This category is global.")

    category = Category(**category.model_dump(), user_id=current_user.id)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}/user", status_code=204)
def delete_category(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.USER.value])],
    category_id: int,
    db: Session = Depends(get_db),
):
    db_category = db.scalar(
        select(Category).where(and_(Category.user_id == current_user.id, Category.id == category_id))
    )
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()


@router.delete("/{category_id}/global", status_code=204)
def delete_global_category(
    current_user: Annotated[UserOut, Security(get_current_user, scopes=[Scopes.ADMIN.value])],
    category_id: int,
    db: Session = Depends(get_db),
):
    db_category = db.scalar(select(Category).where(and_(Category.is_global, Category.id == category_id)))
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
