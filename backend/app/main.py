from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api import account, category, oauth, transaction, user
from .db.database import engine
from .models.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    yield
    pass


app = FastAPI(lifespan=lifespan)

app.include_router(user.router)
app.include_router(oauth.router)
app.include_router(account.router)
app.include_router(category.router)
app.include_router(transaction.router)
