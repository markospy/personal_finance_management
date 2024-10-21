from datetime import datetime

import pytest
from fastapi.testclient import TestClient

from ....schemas.schemas import TransactionType


@pytest.fixture
def create_account(client: TestClient, token_user: dict):
    # Crear una cuenta de prueba para el usuario
    response = client.post(
        "/accounts/",
        headers=token_user,
        json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
    )
    assert response.status_code == 201
    return response.json()["id"]


@pytest.fixture
def create_categories(client: TestClient, token_admin: dict, token_user: dict):
    # Crear categorías de prueba para el administrador y el usuario
    global_category = client.post(
        "/categories/global",
        headers=token_admin,
        json={"name": "Categoría global", "type": TransactionType.EXPENSE.value},
    )

    user_category = client.post(
        "/categories/user",
        headers=token_user,
        json={
            "name": "Categoría de usuario",
            "type": TransactionType.INCOME.value,
            "is_global": False,
        },
    )
    return (global_category.json()["id"], user_category.json()["id"])


@pytest.fixture
def create_transactions(
    client: TestClient,
    token_user: dict,
    create_account: int,
    create_categories: tuple[int],
):
    date = str(datetime.now())
    response = client.post(
        "/transactions",
        headers=token_user,
        json={
            "category_id": create_categories[0],
            "account_id": create_account,
            "amount": 200.0,
            "date": date,
            "comments": "Pago de servicios",
        },
    )
    assert response.status_code == 201

    response = client.post(
        "/transactions",
        headers=token_user,
        json={
            "category_id": create_categories[1],
            "account_id": create_account,
            "amount": 200.0,
            "date": date,
            "comments": "Pago de servicios",
        },
    )
    assert response.status_code == 201
    return


@pytest.mark.transaction
@pytest.mark.create_transaction
class TestCreateTransactions:

    def test_create_expense_transaction(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_categories: tuple[int],
    ):
        date = str(datetime.now())
        date_isoformat = datetime.strptime(date, "%Y-%m-%d %H:%M:%S.%f").isoformat()
        print(f"Categorias: {create_categories}")
        response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "account_id": create_account,
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 201
        transaction = response.json()
        assert transaction["category_id"] == create_categories[0]
        assert transaction["account_id"] == create_account
        assert transaction["amount"] == 200.0
        assert transaction["date"] == date_isoformat
        assert transaction["comments"] == "Pago de servicios"
        assert transaction["type"] == "expense"

        response = client.get(f"/accounts/{create_account}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 4800

    def test_create_income_transaction(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_categories: tuple[int],
    ):
        date = str(datetime.now())
        date_isoformat = datetime.strptime(date, "%Y-%m-%d %H:%M:%S.%f").isoformat()
        response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": create_categories[1],
                "account_id": create_account,
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 201
        transaction = response.json()
        assert transaction["category_id"] == create_categories[1]
        assert transaction["account_id"] == create_account
        assert transaction["amount"] == 200.0
        assert transaction["date"] == date_isoformat
        assert transaction["comments"] == "Pago de servicios"
        assert transaction["type"] == "income"

        response = client.get(f"/accounts/{create_account}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 5200

    def test_create_transaction_invalid_category(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
    ):
        date = str(datetime.now())
        response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": 999,  # Non-existent category ID
                "account_id": create_account,
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"

    def test_create_transaction_invalid_account(
        self,
        client: TestClient,
        token_user: dict,
        create_categories: tuple[int],
    ):
        date = str(datetime.now())
        response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "account_id": 999,  # Non-existent account ID
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"

    def test_create_transaction_insufficient_funds(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_categories: tuple[int],
    ):
        date = str(datetime.now())
        response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "account_id": create_account,
                "amount": 6000.0,  # Monto que excede el balance
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Insufficient funds"


@pytest.mark.transaction
@pytest.mark.get_transaction
@pytest.mark.list_transaction
class TestGetTransactions:

    def test_get_all_transactions(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: None,
    ):

        # Obtener todas las transacciones del usuario
        response = client.get("/transactions/", headers=token_user)
        assert response.status_code == 200
        transactions = response.json()
        assert isinstance(transactions, list)
        assert len(transactions) > 0

    def test_get_transactions_by_account(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_transactions: None,
    ):

        response = client.get(f"/transactions/account/{create_account}", headers=token_user)
        assert response.status_code == 200
        transactions = response.json()
        assert isinstance(transactions, list)
        for transaction in transactions:
            assert transaction["account_id"] == create_account


@pytest.mark.transaction
@pytest.mark.delete_transaction
class TestDeleteTransactions:

    def test_delete_transaction(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_categories: tuple[int],
    ):
        # Primero, crear una transacción para eliminarla
        date = str(datetime.now())
        create_response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "account_id": create_account,
                "amount": 200.0,
                "date": date,
            },
        )
        assert create_response.status_code == 201
        transaction_id = create_response.json()["id"]

        # Luego, eliminar la transacción creada
        delete_response = client.delete(
            f"/transactions/{transaction_id}",
            headers=token_user,
        )
        assert delete_response.status_code == 204

        # Verificar que la transacción ya no exista
        get_response = client.get(
            f"/transactions/{transaction_id}",
            headers=token_user,
        )
        assert get_response.status_code == 404
        assert get_response.json()["detail"] == "Transaction not found"

        # Verifica que el saldo de la cuenta se haya restaurado
        response = client.get(f"/accounts/{create_account}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 5000

    def test_delete_transaction_not_found(
        self,
        client: TestClient,
        token_user: dict,
    ):
        # Intentamos eliminar una transacción con un ID inexistente
        transaction_id = 999  # ID de transacción inexistente
        response = client.delete(
            f"/transactions/{transaction_id}",
            headers=token_user,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Transaction not found"
