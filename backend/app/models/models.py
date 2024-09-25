from datetime import datetime
from typing import List

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from ..schemas.schemas import Frecuency, TransactionType


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(50))
    password: Mapped[str] = mapped_column(String(50))

    account: Mapped[List["Account"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    expected_transaction: Mapped[List["ExpectedTransaction"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    budget: Mapped[List["Budget"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, name={self.name!r}, email={self.email!r})"


class Account(Base):
    __tablename__ = "account"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    currency: Mapped[str] = mapped_column(String(20))
    balance: Mapped[float]
    name: Mapped[str] = mapped_column(String(50))

    user: Mapped["User"] = relationship(back_populates="account")
    transaction: Mapped[List["Transaction"]] = relationship(back_populates="account", cascade="all, delete-orphan")


class ExpectedTransaction(Base):
    __tablename__ = "expected_transaction"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("category.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    amount: Mapped[float]
    frequency: Mapped[Frecuency]
    date: Mapped[datetime]
    type: Mapped[TransactionType]

    user: Mapped["User"] = relationship(back_populates="expected_transaction")
    category: Mapped["Category"] = relationship(back_populates="expected_transaction")


class Category(Base):
    __tablename__ = "category"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50))
    type: Mapped[TransactionType]

    expected_transaction: Mapped[List["ExpectedTransaction"]] = relationship(
        back_populates="category", cascade="all, delete-orphan"
    )
    budget: Mapped[List["Budget"]] = relationship(back_populates="category", cascade="all, delete-orphan")
    transaction: Mapped[List["Transaction"]] = relationship(back_populates="category", cascade="all, delete-orphan")


class Budget(Base):
    __tablename__ = "budget"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("category.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    amount: Mapped[float]
    period: Mapped[dict] = mapped_column(JSON)

    user: Mapped["User"] = relationship(back_populates="budget")
    category: Mapped["Category"] = relationship(back_populates="budget")


class Transaction(Base):
    __tablename__ = "transaction"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("category.id"))
    account_id: Mapped[int] = mapped_column(ForeignKey("account.id"))
    amount: Mapped[float]
    date: Mapped[datetime]
    comments: Mapped[str] = mapped_column(String(250))
    type: Mapped[TransactionType]

    category: Mapped["Category"] = relationship(back_populates="transaction")
    account: Mapped["Account"] = relationship(back_populates="transaction")
