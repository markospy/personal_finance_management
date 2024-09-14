from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, model_validator
from typing_extensions import Annotated, Self


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


class UserOut(BaseModel):
    name: Annotated[str, Field(min_length=2, max_length=50)]
    email: EmailStr


class UserIn(UserOut):
    password: Annotated[str, Field(min_length=6)]


class Account(BaseModel):
    user_id: int
    currency: Annotated[str, Field(max_length=20)]
    amount: Annotated[float, Field(ge=0)]
    name: Annotated[str, Field(max_length=50)]


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

    @model_validator(mode="after")
    def start_date_must_be_before_end_date(self) -> Self:
        if self.start_date <= self.end_date:
            raise ValueError("passwords do not match")
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
