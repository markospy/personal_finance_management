import os

from dotenv import load_dotenv
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .engine import DatabaseConfig, create_engine_from_user_choice

load_dotenv()


class Base(DeclarativeBase):
    pass


# Creation of the engine
database_config = DatabaseConfig(
    os.getenv("USER"),
    os.getenv("PASSWORD"),
    os.getenv("HOST"),
    os.getenv("PORT"),
    os.getenv("DATABASE"),
)

engine = create_engine_from_user_choice("sqlite", database_config)

session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    Base.metadata.create_all(engine)
