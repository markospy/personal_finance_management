from datetime import datetime

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def setup_transactions(
    client_John: TestClient,
    John_token: dict,
    account_John: dict,
    global_expense_category: dict,
    John_income_category: dict,
):
    """Fixture para crear transacciones de prueba"""
    # Crear algunas transacciones de prueba
    date = datetime.now()

    # Gastos en diferentes categorías
    transactions_data = [
        # Gastos
        {"category_id": global_expense_category["id"], "amount": 1000.0, "type": "expense"},
        {"category_id": global_expense_category["id"], "amount": 500.0, "type": "expense"},
        {"category_id": global_expense_category["id"], "amount": 300.0, "type": "expense"},
        # Ingresos
        {"category_id": John_income_category["id"], "amount": 2000.0, "type": "income"},
        {"category_id": John_income_category["id"], "amount": 1500.0, "type": "income"},
    ]

    for data in transactions_data:
        response = client_John.post(
            "/transactions",
            headers=John_token,
            json={
                "category_id": data["category_id"],
                "account_id": account_John["id"],
                "amount": data["amount"],
                "date": str(date),
                "comments": f"Transaction {data['type']}",
            },
        )
        assert response.status_code == 201


@pytest.mark.statistics
class TestStatistics:

    def test_get_monthly_summary(self, client_John: TestClient, John_token: dict, setup_transactions: None):
        """Test para obtener el resumen mensual de gastos e ingresos"""
        response = client_John.get(
            "/statistics/monthly-summary",
            headers=John_token,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )

        assert response.status_code == 200
        data = response.json()

        assert "totalExpenses" in data
        assert "totalIncomes" in data
        assert data["totalExpenses"] == 1800.0  # 1000 + 500 + 300
        assert data["totalIncomes"] == 3500.0  # 2000 + 1500

    def test_get_expenses_by_category(
        self,
        client_John: TestClient,
        John_token: dict,
        setup_transactions: None,
        account_John: dict,
        global_expense_category: dict,
        John_income_category: dict,
    ):
        """Test para obtener las categorías ordenadas por gastos"""
        response = client_John.get(
            "/statistics/expenses-by-category",
            headers=John_token,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )

        assert response.status_code == 200
        categories = response.json()

        assert isinstance(categories, list)
        assert len(categories) > 0

        # Verificar que las categorías están ordenadas por gasto (de mayor a menor)
        for i in range(len(categories) - 1):
            assert categories[i]["totalAmount"] >= categories[i + 1]["totalAmount"]

        # Verificar la primera categoría (la de mayor gasto)
        assert categories[0]["totalAmount"] == 1800.0  # 1000 + 500

    def test_get_incomes_by_category(
        self,
        client_John: TestClient,
        John_token: dict,
        setup_transactions: None,
        account_John: dict,
        global_expense_category: dict,
        John_income_category: dict,
    ):
        """Test para obtener las categorías ordenadas por gastos"""
        response = client_John.get(
            "/statistics/incomes-by-category",
            headers=John_token,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )

        assert response.status_code == 200
        categories = response.json()

        assert isinstance(categories, list)
        assert len(categories) > 0

        # Verificar que las categorías están ordenadas por gasto (de mayor a menor)
        for i in range(len(categories) - 1):
            assert categories[i]["totalAmount"] >= categories[i + 1]["totalAmount"]

        # Verificar la primera categoría (la de mayor gasto)
        assert categories[0]["totalAmount"] == 3500.0  # 1000 + 500

    def test_get_monthly_summary_invalid_date(self, client_John: TestClient, John_token: dict):
        """Test para obtener el resumen mensual con fecha inválida"""
        response = client_John.get(
            "/statistics/monthly-summary",
            headers=John_token,
            params={"year": 2023, "month": 13},  # Mes inválido
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid year or month"

    def test_get_expenses_by_category_invalid_date(self, client_John: TestClient, John_token: dict):
        """Test para obtener las categorías por gastos con fecha inválida"""
        response = client_John.get(
            "/statistics/expenses-by-category",
            headers=John_token,
            params={"year": 2023, "month": 0},  # Mes inválido
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid year or month"

    def test_get_incomes_by_category_invalid_date(self, client_John: TestClient, John_token: dict):
        """Test para obtener las categorías por ingresos con fecha inválida"""
        response = client_John.get(
            "/statistics/incomes-by-category",
            headers=John_token,
            params={"year": 2023, "month": 14},  # Mes inválido
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid year or month"

    def test_get_monthly_summary_no_transactions(self, client_John: TestClient, John_token: dict, account_John: dict):
        """Test para obtener el resumen mensual sin transacciones"""
        # Asegúrate de que no haya transacciones para el mes actual
        response = client_John.get(
            "/statistics/monthly-summary",
            headers=John_token,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Transactions not found"

    def test_get_expenses_by_category_no_transactions(
        self, client_John: TestClient, John_token: dict, account_John: dict
    ):
        """Test para obtener las categorías por gastos sin transacciones"""
        # Asegúrate de que no haya transacciones para el mes actual
        response = client_John.get(
            "/statistics/expenses-by-category",
            headers=John_token,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Transactions not found"

    def test_get_incomes_by_category_no_transactions(
        self, client_John: TestClient, John_token: dict, account_John: dict
    ):
        """Test para obtener las categorías por ingresos sin transacciones"""
        # Asegúrate de que no haya transacciones para el mes actual
        response = client_John.get(
            "/statistics/incomes-by-category",
            headers=John_token,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Transactions not found"

    def test_get_monthly_summary_no_accounts(self, client_John: TestClient, John_token: dict):
        """Test para obtener el resumen mensual sin cuentas"""
        # Simular que no hay cuentas para el usuario actual
        response = client_John.get(
            "/statistics/monthly-summary",
            headers=John_token,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Accounts not found"

    def test_get_expenses_by_category_no_accounts(self, client_John: TestClient, John_token: dict):
        """Test para obtener las categorías por gastos sin cuentas"""
        # Simular que no hay cuentas para el usuario actual
        response = client_John.get(
            "/statistics/expenses-by-category",
            headers=John_token,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Accounts not found"

    def test_get_incomes_by_category_no_accounts(self, client_John: TestClient, John_token: dict):
        """Test para obtener las categorías por ingresos sin cuentas"""
        # Simular que no hay cuentas para el usuario actual
        response = client_John.get(
            "/statistics/incomes-by-category",
            headers=John_token,
            params={"year": datetime.now().year, "month": datetime.now().month},
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Accounts not found"
