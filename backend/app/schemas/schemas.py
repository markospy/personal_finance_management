from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, model_validator
from pydantic_extra_types.currency_code import Currency
from typing_extensions import Annotated, Self


class TransactionType(str, Enum):
    EXPENSE = "expense"
    INCOME = "income"


class Frecuency(str, Enum):
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    SEMIANNUAL = "semiannual"
    ANNUAL = "annual"


class Scopes(Enum):
    USER = "user"
    ADMIN = "admin"


class UserBase(BaseModel):
    name: Annotated[str, Field(min_length=2, max_length=50)]
    email: EmailStr


class UserOut(UserBase):
    id: int


class UserIn(UserBase):
    password: Annotated[str, Field(min_length=6)]

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Joe Doe",
                    "email": "joedoe@mail.com",
                    "password": "secret",
                }
            ]
        }
    }


class UserInDB(UserOut):
    password: str


class UserUpdate(BaseModel):
    name: Annotated[str | None, Field(min_length=2, max_length=5)] = None
    email: EmailStr | None = None
    password: Annotated[str | None, Field(min_length=6)] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None
    scopes: list[str] = []


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


class CategoryIn(BaseModel):
    name: Annotated[str, Field(max_length=50)]
    type: TransactionType
    is_global: Annotated[bool, Field(default=True)]


class CategoryOut(CategoryIn):
    id: int
    user_id: int | None = None


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
