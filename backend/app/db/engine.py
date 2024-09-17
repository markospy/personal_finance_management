from sqlalchemy import create_engine

engine = create_engine(
    "postgresql+psycopg2://postgres:postgres@db:5432/mydb",
    pool_size=20,
    max_overflow=0,
)
