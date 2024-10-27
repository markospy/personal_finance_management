from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api import (
    account,
    budget,
    category,
    expected_transactions,
    oauth,
    transaction,
    user,
)
from .db.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield
    pass


app = FastAPI(lifespan=lifespan)

app.include_router(user.router)
app.include_router(oauth.router)
app.include_router(account.router)
app.include_router(category.router)
app.include_router(transaction.router)
app.include_router(budget.router)
app.include_router(expected_transactions.router)
