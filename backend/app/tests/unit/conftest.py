import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from ...api.oauth import create_access_token
from ...db.dependencie import get_db
from ...main import app

# from app import settings
from ...models.models import Base, User
from ...schemas.schemas import UserIn, UserOut


@pytest.fixture(scope="session")
def engine():
    """
    Create the test database (if needed) and engine
    """
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=test_engine)
    return test_engine


@pytest.fixture(autouse=True)
def db(engine: Engine, request):
    """
    Provides a DB session that will roll back after the test is complete to ensure clean
    tables for each test. See: https://stackoverflow.com/a/67348153
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(autocommit=False, autoflush=False, bind=connection)

    def override_get_db():
        try:
            db = session
            yield db
        finally:
            db.close()

    # Begin a nested transaction (using SAVEPOINT)
    nested = connection.begin_nested()

    # If the application code calls `session.commit`, it will end the nested
    # transaction. We need to start a new one when that happens.
    @event.listens_for(session, "after_transaction_end")
    def end_savepoint(seccion, transaction):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    app.dependency_overrides[get_db] = override_get_db
    yield session

    # Rollback the overall transaction, restoring the state before the test ran
    transaction.rollback()
    connection.close()
    del app.dependency_overrides[get_db]


@pytest.fixture
def user(db: Session):
    user = UserIn(name="John Doe", email="john@gmail.com", password="123456")
    new_user = user.model_dump(exclude_unset=True)
    db.add(User(**new_user))
    db.commit()
    stmt = select(User).order_by(User.id.desc())
    created_user = db.scalar(stmt)
    user_data = UserOut(**created_user.__dict__).model_dump()
    return user_data


@pytest.fixture
def client(user):
    client = TestClient(app)
    client.user = user
    return client


@pytest.fixture
def token_user(client):
    name = {"sub": client.user["name"], "scopes": ["user"]}
    token = create_access_token(name)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def token_admin(client):
    name = {"sub": client.user["name"], "scopes": ["admin"]}
    token = create_access_token(name)
    return {"Authorization": f"Bearer {token}"}
