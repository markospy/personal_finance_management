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
def setup_transactions(client: TestClient, token_user: dict, create_account: int, create_categories: tuple[int]):
    """Fixture para crear transacciones de prueba"""
    # Crear algunas transacciones de prueba
    date = datetime.now()

    # Gastos en diferentes categorías
    transactions_data = [
        # Gastos
        {"category_id": create_categories[0], "amount": 1000.0, "type": "expense"},
        {"category_id": create_categories[0], "amount": 500.0, "type": "expense"},
        {"category_id": create_categories[0], "amount": 300.0, "type": "expense"},
        # Ingresos
        {"category_id": create_categories[1], "amount": 2000.0, "type": "income"},
        {"category_id": create_categories[1], "amount": 1500.0, "type": "income"},
    ]

    for data in transactions_data:
        response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": data["category_id"],
                "account_id": create_account,
                "amount": data["amount"],
                "date": str(date),
                "comments": f"Transaction {data['type']}",
            },
        )
        assert response.status_code == 201


@pytest.mark.statistics
class TestStatistics:

    def test_get_monthly_summary(self, client: TestClient, token_user: dict, setup_transactions):
        """Test para obtener el resumen mensual de gastos e ingresos"""
        response = client.get(
            "/statistics/monthly-summary",
            headers=token_user,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )

        assert response.status_code == 200
        data = response.json()

        assert "total_expenses" in data
        assert "total_income" in data
        assert data["total_expenses"] == 1800.0  # 1000 + 500 + 300
        assert data["total_income"] == 3500.0  # 2000 + 1500

    def test_get_expenses_by_category(self, client: TestClient, token_user: dict, setup_transactions):
        """Test para obtener las categorías ordenadas por gastos"""
        response = client.get(
            "/statistics/expenses-by-category",
            headers=token_user,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )

        assert response.status_code == 200
        categories = response.json()

        assert isinstance(categories, list)
        assert len(categories) > 0

        # Verificar que las categorías están ordenadas por gasto (de mayor a menor)
        for i in range(len(categories) - 1):
            assert categories[i]["total_amount"] >= categories[i + 1]["total_amount"]

        # Verificar la primera categoría (la de mayor gasto)
        assert categories[0]["total_amount"] == 1800.0  # 1000 + 500

    def test_get_incomes_by_category(self, client: TestClient, token_user: dict, setup_transactions):
        """Test para obtener las categorías ordenadas por gastos"""
        response = client.get(
            "/statistics/incomes-by-category",
            headers=token_user,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )

        assert response.status_code == 200
        categories = response.json()

        assert isinstance(categories, list)
        assert len(categories) > 0

        # Verificar que las categorías están ordenadas por gasto (de mayor a menor)
        for i in range(len(categories) - 1):
            assert categories[i]["total_amount"] >= categories[i + 1]["total_amount"]

        # Verificar la primera categoría (la de mayor gasto)
        assert categories[0]["total_amount"] == 3500.0  # 1000 + 500
