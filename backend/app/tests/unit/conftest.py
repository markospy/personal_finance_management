from datetime import datetime, timedelta

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
from ...schemas.schemas import TransactionType, UserIn, UserOut


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
def John(db: Session):
    user = UserIn(name="John Doe", email="john@gmail.com", password="123456")
    new_user = user.model_dump(exclude_unset=True)
    db.add(User(**new_user))
    db.commit()
    stmt = select(User).order_by(User.id.desc())
    created_user = db.scalar(stmt)
    user_data = UserOut(**created_user.__dict__).model_dump()
    return user_data


@pytest.fixture
def client_John(John):
    client = TestClient(app)
    client.user = John
    return client


@pytest.fixture
def John_token(client_John):
    name = {"sub": client_John.user["name"], "scopes": ["user"]}
    token = create_access_token(name)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def token_admin(client_John):
    name = {"sub": client_John.user["name"], "scopes": ["admin"]}
    token = create_access_token(name)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def Jane(db: Session):
    user = UserIn(name="Jane Doe", email="john@gmail.com", password="123456")
    new_user = user.model_dump(exclude_unset=True)
    db.add(User(**new_user))
    db.commit()
    stmt = select(User).order_by(User.id.desc())
    created_user = db.scalar(stmt)
    user_data = UserOut(**created_user.__dict__).model_dump()
    return user_data


@pytest.fixture
def client_Jane(Jane):
    client = TestClient(app)
    client.user = Jane
    return client


@pytest.fixture
def Jane_token(client_Jane):
    name = {"sub": client_Jane.user["name"], "scopes": ["user"]}
    token = create_access_token(name)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def account_John(client_John: TestClient, John_token: dict):
    # Crear una cuenta de prueba para el usuario
    response = client_John.post(
        "/accounts/",
        headers=John_token,
        json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def global_expense_category(client_John: TestClient, token_admin: dict):
    # Crear categorías de prueba para el administrador y el usuario
    category = client_John.post(
        "/categories/global",
        headers=token_admin,
        json={"name": "Categoría global", "type": TransactionType.EXPENSE.value},
    )
    return category.json()


@pytest.fixture
def John_income_category(client_John: TestClient, John_token: dict):
    category = client_John.post(
        "/categories/user",
        headers=John_token,
        json={
            "name": "Categoría de usuario",
            "type": TransactionType.INCOME.value,
            "is_global": False,
        },
    )
    return category.json()


@pytest.fixture
def expense_transaction_John(
    client_John: TestClient,
    John_token: dict,
    account_John: dict,
    global_expense_category: dict,
):
    transaction = client_John.post(
        "/transactions",
        headers=John_token,
        json={
            "category_id": global_expense_category["id"],
            "account_id": account_John["id"],
            "amount": 200.0,
            "date": str(datetime.now()),
            "comments": "Cobro de servicios",
        },
    )
    assert transaction.status_code == 201
    return transaction.json()


@pytest.fixture
def income_transaction_John(
    client_John: TestClient,
    John_token: dict,
    account_John: dict,
    John_income_category: dict,
):
    transaction = client_John.post(
        "/transactions",
        headers=John_token,
        json={
            "category_id": John_income_category["id"],
            "account_id": account_John["id"],
            "amount": 200.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios",
        },
    )
    assert transaction.status_code == 201
    return transaction.json()


@pytest.fixture
def budget_John(
    client_John: TestClient,
    John_token: dict,
    global_expense_category: dict,
):
    start_date = datetime.now()
    end_date = start_date + timedelta(days=30)
    budget = client_John.post(
        "/budgets/",
        headers=John_token,
        json={
            "category_id": global_expense_category["id"],
            "amount": 1000.0,
            "period": {
                "start_date": str(start_date),
                "end_date": str(end_date),
            },
        },
    )
    assert budget.status_code == 201
    return budget.json()


@pytest.fixture
def account_Jane(client_Jane: TestClient, Jane_token: dict):
    # Crear una cuenta de prueba para el usuario
    response = client_Jane.post(
        "/accounts/",
        headers=Jane_token,
        json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def transaction_Jane(
    client_Jane: TestClient,
    Jane_token: dict,
    account_Jane: int,
    global_expense_category: int,
):
    date = str(datetime.now())
    transaction = client_Jane.post(
        "/transactions",
        headers=Jane_token,
        json={
            "category_id": global_expense_category["id"],
            "account_id": account_Jane["id"],
            "amount": 200.0,
            "date": date,
            "comments": "Pago de servicios",
        },
    )
    assert transaction.status_code == 201
    return transaction.json()
