from datetime import datetime
from enum import Enum

from pydantic import (
    AliasGenerator,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    model_validator,
)
from pydantic.alias_generators import to_camel
from pydantic_extra_types.currency_code import Currency
from typing_extensions import Annotated, Self


class TransactionType(str, Enum):
    EXPENSE = "expense"
    INCOME = "income"


class BudgetsSavingsType(str, Enum):
    BUDGET = "budget"
    SAVINGS = "saving"


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
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr


class UserOut(UserBase):
    id: int


class UserIn(UserBase):
    password: str = Field(min_length=6)

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
    balance: float = Field(ge=0)
    name: str = Field(max_length=50)


class AccountOut(AccountIn):
    id: int
    user_id: int

    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            serialization_alias=to_camel,
        )
    )


class ExpectedTransactionIn(BaseModel):
    category_id: int
    amount: float = Field(ge=0)
    frequency: Frecuency | None = None
    date: datetime | None = Field(ge=datetime.now(), default=None)


class ExpectedTransactionOut(ExpectedTransactionIn):
    id: int
    user_id: int

    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            serialization_alias=to_camel,
        )
    )


class ExpectedTransactionUpdate(BaseModel):
    category_id: int | None = None
    amount: float = Field(ge=0, default=None)
    frequency: Frecuency | None = None
    date: datetime = Field(ge=datetime.now(), default=None)


class CategoryIn(BaseModel):
    name: str = Field(max_length=50)
    type: TransactionType
    is_global: bool = Field(default=True)


class CategoryOut(CategoryIn):
    id: int
    user_id: int | None = None

    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            serialization_alias=to_camel,
        )
    )


class Period(BaseModel):
    start_date: datetime
    end_date: datetime

    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            serialization_alias=to_camel,
        )
    )

    @model_validator(mode="before")
    def start_date_must_be_before_end_date(self) -> Self:
        if self["start_date"] >= self["end_date"]:
            raise ValueError("Start date must be before end date")
        return self


class BudgetsSavingsBase(BaseModel):
    type: BudgetsSavingsType
    amount: float = Field(ge=0)
    period: Period


class BudgetsSavingsIn(BudgetsSavingsBase):
    category_id: int


class BudgetsSavingsOut(BudgetsSavingsIn):
    id: int
    user_id: int

    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            serialization_alias=to_camel,
        )
    )


class BudgetsSavingsUpdate(BudgetsSavingsBase):
    pass


class TransactionIn(BaseModel):
    category_id: int
    account_id: int
    amount: float = Field(ge=0)
    date: datetime | None = Field(default=datetime.now())
    comments: str | None = Field(max_length=250, default=None)


class TransactionOut(TransactionIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    date: datetime

    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            serialization_alias=to_camel,
        )
    )


class TransactionUpdate(BaseModel):
    category_id: int | None = None
    # El id de la cuenta siempre se debe proporcionar para poder comprobar si es la ultima transaccion.
    account_id: int
    amount: float | None = Field(ge=0, default=None)
    date: datetime | None = Field(default=datetime.now())
    comments: str | None = Field(max_length=250, default=None)
