from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api import user
from .db.database import engine
from .models.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    yield
    pass


app = FastAPI(lifespan=lifespan)

app.include_router(user.router)
