from datetime import datetime

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

    category: Mapped[list["Category"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    account: Mapped[list["Account"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    expected_transaction: Mapped[list["ExpectedTransaction"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    budget: Mapped[list["Budget"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, name={self.name!r}, email={self.email!r})"


class Account(Base):
    __tablename__ = "account"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    currency: Mapped[str] = mapped_column(String(20))
    balance: Mapped[float]
    name: Mapped[str] = mapped_column(String(50))

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="cascade"))
    user: Mapped["User"] = relationship(back_populates="account")
    transaction: Mapped[list["Transaction"]] = relationship(back_populates="account", cascade="all, delete-orphan")


class ExpectedTransaction(Base):
    __tablename__ = "expected_transaction"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    amount: Mapped[float]
    frequency: Mapped[Frecuency]
    date: Mapped[datetime]
    type: Mapped[TransactionType]

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="cascade"))
    user: Mapped["User"] = relationship(back_populates="expected_transaction")
    category_id: Mapped[int] = mapped_column(ForeignKey("category.id", ondelete="cascade"))
    category: Mapped["Category"] = relationship(back_populates="expected_transaction")


class Category(Base):
    __tablename__ = "category"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50))
    type: Mapped[TransactionType]
    is_global: Mapped[bool] = mapped_column(default=True)

    user_id: Mapped[int | None] = mapped_column(ForeignKey("user.id", ondelete="cascade"))
    user: Mapped["User"] = relationship(back_populates="category")

    expected_transaction: Mapped[list["ExpectedTransaction"]] = relationship(
        back_populates="category", cascade="all, delete-orphan"
    )
    budget: Mapped[list["Budget"]] = relationship(back_populates="category", cascade="all, delete-orphan")
    transaction: Mapped[list["Transaction"]] = relationship(back_populates="category", cascade="all, delete-orphan")


class Budget(Base):
    __tablename__ = "budget"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("category.id"))
    amount: Mapped[float]
    period: Mapped[dict] = mapped_column(JSON)

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="cascade"))
    user: Mapped["User"] = relationship(back_populates="budget")
    category: Mapped["Category"] = relationship(back_populates="budget")


class Transaction(Base):
    __tablename__ = "transaction"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    amount: Mapped[float]
    date: Mapped[datetime]
    comments: Mapped[str] = mapped_column(String(250))
    type: Mapped[TransactionType]

    category_id: Mapped[int] = mapped_column(ForeignKey("category.id", ondelete="cascade"))
    category: Mapped["Category"] = relationship(back_populates="transaction")
    account_id: Mapped[int] = mapped_column(ForeignKey("account.id", ondelete="cascade"))
    account: Mapped["Account"] = relationship(back_populates="transaction")
