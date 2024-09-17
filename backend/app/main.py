from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.engine import engine
from app.models.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    yield
    pass


app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root():
    return {"msg": "Hola Mundo"}
