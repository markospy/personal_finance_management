from urllib.parse import urlparse

import pytest
from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

# from app import settings
from ...db.dependencie import get_db
from ...main import app
from ...models.models import Base


@pytest.fixture(scope="session")
def engine():
    """
    Create the test database (if needed) and engine
    """
    test_db_name = "test_app"
    # db_url = urlparse(str(settings.DATABASE_URL))
    # test_engine = create_engine(db_url._replace(path=f"/{test_db_name}").geturl())
    db_url = urlparse(f"sqlite:///{test_db_name}.db")
    test_engine = create_engine(f"sqlite:///{test_db_name}.db")

    try:
        Base.metadata.drop_all(bind=test_engine)
    except OperationalError as err:
        if f'database "{test_db_name}" does not exist' not in str(err):
            raise
        root_db_url = db_url._replace(path="/postgres").geturl()
        conn = create_engine(root_db_url, isolation_level="AUTOCOMMIT").connect()
        conn.execute(text(f"CREATE DATABASE {test_db_name}"))
        conn.close()
    finally:
        Base.metadata.create_all(bind=test_engine)

    return test_engine


@pytest.fixture(autouse=True)
def db(engine: Engine):
    """
    Provides a DB session that will roll back after the test is complete to ensure clean
    tables for each test. See: https://stackoverflow.com/a/67348153
    """
    connection = engine.connect()
    transaction = connection.begin()
    TestingSessionLocal = Session(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        try:
            db = TestingSessionLocal
            yield db
        finally:
            db.close()

    # Begin a nested transaction (using SAVEPOINT)
    nested = connection.begin_nested()

    # If the application code calls `session.commit`, it will end the nested
    # transaction. We need to start a new one when that happens.
    @event.listens_for(TestingSessionLocal, "after_transaction_end")
    def end_savepoint(TestingSessionLocal, transaction):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    app.dependency_overrides[get_db] = override_get_db
    yield TestingSessionLocal
    del app.dependency_overrides[get_db]

    # Rollback the overall transaction, restoring the state before the test ran
    TestingSessionLocal.close()
    transaction.rollback()
    connection.close()
