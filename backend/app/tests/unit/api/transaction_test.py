from datetime import datetime

import pytest
from fastapi.testclient import TestClient

from ....schemas.schemas import TransactionType


@pytest.fixture
def test_account(client: TestClient, token_user: dict):
    # Crear una cuenta de prueba para el usuario
    response = client.post(
        "/accounts/",
        headers=token_user,
        json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
    )
    assert response.status_code == 201
    return response.json()["id"]


@pytest.fixture
def test_categories(client: TestClient, token_admin: dict, token_user: dict):
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


@pytest.mark.transaction
@pytest.mark.create_transaction
class TestCreateTransactions:

    def test_create_expense_transaction(
        self,
        client: TestClient,
        token_user,
        test_account,
        test_categories,
    ):
        date = str(datetime.now())
        date_isoformat = datetime.strptime(date, "%Y-%m-%d %H:%M:%S.%f").isoformat()
        response = client.post(
            "/transactions/",
            headers=token_user,
            json={
                "category_id": test_categories[0],
                "account_id": test_account,
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 201
        transaction = response.json()
        assert transaction["category_id"] == test_categories[0]
        assert transaction["account_id"] == test_account
        assert transaction["amount"] == 200.0
        assert transaction["date"] == date_isoformat
        assert transaction["comments"] == "Pago de servicios"
        assert transaction["type"] == "expense"

        response = client.get(f"/accounts/{test_account}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 4800

    def test_create_income_transaction(
        self,
        client: TestClient,
        token_user,
        test_account,
        test_categories,
    ):
        date = str(datetime.now())
        date_isoformat = datetime.strptime(date, "%Y-%m-%d %H:%M:%S.%f").isoformat()
        response = client.post(
            "/transactions/",
            headers=token_user,
            json={
                "category_id": test_categories[1],
                "account_id": test_account,
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 201
        transaction = response.json()
        assert transaction["category_id"] == test_categories[1]
        assert transaction["account_id"] == test_account
        assert transaction["amount"] == 200.0
        assert transaction["date"] == date_isoformat
        assert transaction["comments"] == "Pago de servicios"
        assert transaction["type"] == "income"

        response = client.get(f"/accounts/{test_account}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 5200

    def test_create_transaction_invalid_category(
        self,
        client: TestClient,
        token_user,
        test_account,
    ):
        date = str(datetime.now())
        response = client.post(
            "/transactions/",
            headers=token_user,
            json={
                "category_id": 999,  # Non-existent category ID
                "account_id": test_account,
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
        token_user,
        test_categories,
    ):
        date = str(datetime.now())
        response = client.post(
            "/transactions/",
            headers=token_user,
            json={
                "category_id": test_categories[0],
                "account_id": 999,  # Non-existent account ID
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"


class TestGetTransactions:

    def test_get_all_transactions(self, client: TestClient, test_user, token_user: dict):
        # Obtener todas las transacciones del usuario
        response = client.get("/transactions/", headers=token_user)
        assert response.status_code == 200
        transactions = response.json()
        assert isinstance(transactions, list)
        assert len(transactions) > 0

    def test_get_transactions_by_account(self, client: TestClient, test_user, test_account):
        # Obtener todas las transacciones de una cuenta específica
        response = client.get(
            f"/transactions/account/{test_account['id']}", headers={"Authorization": f"Bearer {test_user['token']}"}
        )
        assert response.status_code == 200
        transactions = response.json()
        assert isinstance(transactions, list)
        for transaction in transactions:
            assert transaction["account_id"] == test_account["id"]


class TestDeleteTransactions:

    def test_delete_transaction(self, client: TestClient, test_user, test_account):
        # Primero, crear una transacción para eliminarla
        create_response = client.post(
            "/transactions/",
            json={
                "category_id": 1,
                "account_id": test_account["id"],
                "amount": 150.0,
                "date": "2024-09-16T12:00:00",
                "comments": "Compra de comida",
                "type": "Expense",
            },
            headers={"Authorization": f"Bearer {test_user['token']}"},
        )
        assert create_response.status_code == 201
        transaction_id = create_response.json()["id"]

        # Luego, eliminar la transacción creada
        delete_response = client.delete(
            f"/transactions/{transaction_id}", headers={"Authorization": f"Bearer {test_user['token']}"}
        )
        assert delete_response.status_code == 204

        # Verificar que la transacción ya no exista
        get_response = client.get(
            f"/transactions/{transaction_id}", headers={"Authorization": f"Bearer {test_user['token']}"}
        )
        assert get_response.status_code == 404
        assert get_response.json()["detail"] == "Transaction not found"
