import sqlalchemy
from sqlalchemy import create_engine

# Defines the function to create the database engine through
# the DatabaseConfig configuration object.


class DatabaseConfig:
    def __init__(
        self,
        user: str,
        password: str,
        host: str,
        port: str,
        database: str,
    ):
        self.user = user
        self.password = password
        self.host = host
        self.port = port
        self.database = database


def create_engine_from_user_choice(database_type, database_config) -> sqlalchemy.engine.base.Engine:
    db = database_config

    if database_type == "sqlite":
        engine = create_engine(f"sqlite:///{db.database}.db", echo=True)
    elif database_type == "postgresql_prod":
        engine = create_engine(
            f"postgresql+psycopg2://{db.user}:{db.password}@{db.host}:{db.port}/{db.database}", echo=True
        )
    else:
        raise ValueError(f"Invalid database type: {database_type}")

    return engine
