import os

from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker

from ..models.models import Base
from .engine import DatabaseConfig, create_engine_from_user_choice

load_dotenv()


# Creation of the engine
database_config = DatabaseConfig(
    os.getenv("POSTGRES_USER"),
    os.getenv("POSTGRES_PASSWORD"),
    os.getenv("HOST"),
    os.getenv("PORT"),
    os.getenv("POSTGRES_DB"),
)

engine = create_engine_from_user_choice("sqlite", database_config)

session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    Base.metadata.create_all(engine)
