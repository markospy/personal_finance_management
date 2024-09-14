from datetime import datetime
from typing import List

from sqlalchemy import JSON, DateTime, Enum, Float, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from ..schemas.schemas import Frecuency, TransactionType


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "user"

    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(50))
    password: Mapped[str] = mapped_column(String(50))

    account: Mapped[List["Account"]] = relationship(back_populates="user", cascade="all, delete-orpha")
    expected_transaction: Mapped[List["ExpectedTransaction"]] = relationship(
        back_populates="user", cascade="all, delete-orpha"
    )
    budget: Mapped[List["Budget"]] = relationship(back_populates="user", cascade="all, delete-orpha")

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, name={self.name!r}, fullname={self.fullname!r})"


class Account(Base):
    __tablename__ = "account"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(20))
    amount: Mapped[float] = mapped_column(Float)
    name: Mapped[str] = mapped_column(String(50))

    user: Mapped["User"] = relationship(back_populates="account")
    transaction: Mapped[List["Transaction"]] = relationship(back_populates="account", cascade="all, delete-orpha")


class ExpectedTransaction(Base):
    __tablename__ = "expected_transaction"

    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(Integer)
    user_id: Mapped[int] = mapped_column(Integer)
    amount: Mapped[float] = mapped_column(Float)
    frequency: Mapped[Frecuency] = mapped_column(Enum(Frecuency))
    date: Mapped[datetime] = mapped_column(DateTime)
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType))

    user: Mapped["User"] = relationship(back_populates="expected_transaction")
    category: Mapped["Category"] = relationship(back_populates="expected_transaction")


class Category(Base):
    __tablename__ = "category"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType))

    expected_transaction: Mapped[List["ExpectedTransaction"]] = relationship(
        back_populates="category", cascade="all, delete-orpha"
    )
    budget: Mapped[List["Budget"]] = relationship(back_populates="category", cascade="all, delete-orpha")
    transaction: Mapped[List["Transaction"]] = relationship(back_populates="category", cascade="all, delete-orpha")


class Budget(Base):
    __tablename__ = "budget"

    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(Integer)
    user_id: Mapped[int] = mapped_column(Integer)
    amount: Mapped[float] = mapped_column(Float)
    period: Mapped[dict] = mapped_column(JSON)

    user: Mapped["User"] = relationship(back_populates="budget")
    category: Mapped["Category"] = relationship(back_populates="budget")


class Transaction(Base):
    __tablename__ = "transaction"

    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(Integer)
    account_id: Mapped[int] = mapped_column(Integer)
    amount: Mapped[float] = mapped_column(Float)
    date: Mapped[datetime] = mapped_column(DateTime)
    comments: Mapped[str] = mapped_column(String(250))
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType))

    category: Mapped["Category"] = relationship(back_populates="transaction")
    account: Mapped["Account"] = relationship(back_populates="transaction")
