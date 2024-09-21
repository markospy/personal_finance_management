from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, model_validator
from typing_extensions import Annotated, Self

from .currency import Currency


class TransactionType(str, Enum):
    SPENT = "spent"
    INCOME = "income"


class Frecuency(str, Enum):
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    SEMIANNUAL = "semiannual"
    ANNUAL = "annual"


class UserBase(BaseModel):
    name: Annotated[str, Field(min_length=2, max_length=50)]
    email: EmailStr


class UserOut(UserBase):
    id: int


class UserIn(UserBase):
    password: Annotated[str, Field(min_length=6)]


class AccountIn(BaseModel):
    currency: Annotated[Currency, Field(default="USD")]
    balance: Annotated[float, Field(ge=0)]
    name: Annotated[str, Field(max_length=50)]


class AccountOut(AccountIn):
    id: int
    user_id: int


class ExpectedTransaction(BaseModel):
    category_id: int
    user_id: int
    amount: Annotated[float, Field(ge=0)]
    frequency: Frecuency
    date: Annotated[datetime, Field(ge=datetime.now())]
    type: TransactionType


class Category(BaseModel):
    name: Annotated[str, Field(max_length=50)]
    type: TransactionType


class Period(BaseModel):
    start_date: datetime
    end_date: datetime

    @model_validator(mode="before")
    def start_date_must_be_before_end_date(self) -> Self:
        if self["start_date"] >= self["end_date"]:
            raise ValueError("Start date must be before end date")
        return self


class Budget(BaseModel):
    category_id: int
    user_id: int
    amount: Annotated[float, Field(ge=0)]
    period: Period


class Transaction(BaseModel):
    category_id: int
    account_id: int
    amount: Annotated[float, Field(ge=0)]
    date: Annotated[datetime, Field(ge=datetime.now())]
    comments: Annotated[str, Field(max_length=250)]
    type: TransactionType
