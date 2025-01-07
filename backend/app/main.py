from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import (
    account,
    budgets_savings,
    category,
    expected_transactions,
    oauth,
    statistics,
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

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(oauth.router)
app.include_router(account.router)
app.include_router(category.router)
app.include_router(transaction.router)
app.include_router(budgets_savings.router)
app.include_router(expected_transactions.router)
app.include_router(statistics.router)
