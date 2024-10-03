from typing import List

from fastapi import APIRouter, Depends
from sqlachemy import select
from sqlalchemy.orm import Session

from ..api.oauth import get_current_user
from ..db.dependencie import get_db
from ..models.models import Category, User
from ..schemas.schemas import CategoryIn, CategoryOut

router = APIRouter()


@router.post("/categories/", response_model=CategoryOut)
def create_category(
    category: CategoryIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    db.add(Category(**category.model_dump(), user_id=current_user.id))
    db.commit()
    new_category = db.scalar(select(Category).order_by(Category.id.desc()))
    return new_category


@router.get("/categories/", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # lógica para obtener todas las categorías del usuario
    pass


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # lógica para eliminar una categoría
    pass
