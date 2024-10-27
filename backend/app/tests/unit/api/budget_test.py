from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def create_categories(client: TestClient, token_admin: dict, token_user: dict):
    # Crear categorías de prueba
    global_category = client.post(
        "/categories/global",
        headers=token_admin,
        json={"name": "Categoría global", "type": "expense"},
    )
    assert global_category.status_code == 201

    user_category = client.post(
        "/categories/user",
        headers=token_user,
        json={
            "name": "Categoría de usuario",
            "type": "expense",
            "is_global": False,
        },
    )
    assert user_category.status_code == 201
    return (global_category.json()["id"], user_category.json()["id"])


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


@pytest.mark.budget
@pytest.mark.create_budget
class TestBudgetCreation:

    def test_create_budget(self, client: TestClient, token_user: dict, create_categories: tuple[int]):
        # Crear un presupuesto válido
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        response = client.post(
            "/budgets/",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "amount": 1000.0,
                "period": {
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                },
            },
        )
        assert response.status_code == 201
        budget = response.json()
        assert budget["category_id"] == create_categories[0]
        assert budget["amount"] == 1000.0
        assert "start_date" in budget["period"]
        assert "end_date" in budget["period"]

    def test_create_budget_invalid_dates(self, client: TestClient, token_user: dict, create_categories: tuple[int]):
        # Intentar crear un presupuesto con fechas inválidas (end_date antes que start_date)
        start_date = datetime.now()
        end_date = start_date - timedelta(days=30)
        response = client.post(
            "/budgets/",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "amount": 1000.0,
                "period": {
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                },
            },
        )
        assert response.status_code == 422
        assert response.json()["detail"][0]["msg"] == "Value error, Start date must be before end date"

    def test_create_budget_invalid_category(self, client: TestClient, token_user: dict):
        # Intentar crear un presupuesto con una categoría inexistente
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        response = client.post(
            "/budgets/",
            headers=token_user,
            json={
                "category_id": 99999,
                "amount": 1000.0,
                "period": {
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                },
            },
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"

    def test_get_budget_status(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_categories: tuple[int],
    ):
        # Crear un presupuesto válido
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        response = client.post(
            "/budgets/",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "amount": 1000.0,
                "period": {
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                },
            },
        )
        assert response.status_code == 201
        budget_id = response.json()["id"]

        # Crear algunas transacciones para simular gastos
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

        # Consultar el estado de los presupuestos
        response = client.get(f"/budgets/{budget_id}/status", headers=token_user)
        assert response.status_code == 200
        data = response.json()

        # Verificar la respuesta
        assert data["category_id"] == budget_id
        assert data["budget_amount"] == 1000.0
        assert data["spent_amount"] == 200.0
        assert data["remaining_amount"] == 800.0
        assert not data["is_exceeded"]


@pytest.mark.budget
@pytest.mark.get_budget
class TestGetBudget:

    def test_get_all_budgets(self, client: TestClient, token_user: dict, create_categories: tuple[int]):
        # Crear varios presupuestos
        for i in range(2):
            start_date = datetime.now()
            end_date = start_date + timedelta(days=30)
            response = client.post(
                "/budgets/",
                headers=token_user,
                json={
                    "category_id": create_categories[i - 1],
                    "amount": 1000.0 + i * 500,  # Diferentes montos para cada presupuesto
                    "period": {
                        "start_date": str(start_date),
                        "end_date": str(end_date),
                    },
                },
            )
            assert response.status_code == 201

        # Obtener todos los presupuestos
        response_get = client.get("/budgets/", headers=token_user)
        assert response_get.status_code == 200
        budgets = response_get.json()
        assert isinstance(budgets, list)  # Verificar que la respuesta sea una lista
        assert len(budgets) == 2  # Verificar que se hayan creado 3 presupuestos

        # Verificar que cada presupuesto tenga los campos esperados
        for budget in budgets:
            assert "id" in budget
            assert "category_id" in budget
            assert "amount" in budget
            assert "period" in budget
            assert "start_date" in budget["period"]
            assert "end_date" in budget["period"]

    def test_get_all_budgets_not_found(self, client: TestClient, token_user: dict):
        response = client.get("/budgets/", headers=token_user)
        assert response.status_code == 404
        assert response.json()["detail"] == "Budgets is not found"

    def test_get_one_budget(
        self,
        client: TestClient,
        token_user: dict,
        create_categories: tuple[int],
    ):
        # Crear un presupuesto válido
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        response = client.post(
            "/budgets/",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "amount": 1000.0,
                "period": {
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                },
            },
        )
        assert response.status_code == 201
        budget_post = response.json()

        response_budget = client.get("/budgets/1", headers=token_user)
        budget = response_budget.json()
        assert response_budget.status_code == 200
        assert budget["id"] == budget_post["id"]
        assert budget["category_id"] == budget_post["category_id"]
        assert budget["amount"] == budget_post["amount"]
        assert budget["period"]["start_date"] in budget_post["period"]["start_date"]
        assert budget["period"]["end_date"] in budget_post["period"]["end_date"]

    def test_get_one_budget_not_found(self, client: TestClient, token_user: dict):
        response = client.get("/budgets/1", headers=token_user)
        assert response.status_code == 404
        assert response.json()["detail"] == "Budgets is not found"


@pytest.mark.budget
@pytest.mark.update_budget
class TestUpdateBudget:

    def test_update_budget(self, client: TestClient, token_user: dict, create_categories: tuple[int]):
        # Crear un presupuesto válido
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        response = client.post(
            "/budgets/",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "amount": 1000.0,
                "period": {
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                },
            },
        )
        assert response.status_code == 201
        budget_post = response.json()

        # Actualizar el presupuesto creado
        new_start_date = datetime.now() + timedelta(days=1)
        new_end_date = new_start_date + timedelta(days=29)
        response_update = client.put(
            f"/budgets/{budget_post['id']}",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "amount": 1500.0,
                "period": {
                    "start_date": str(new_start_date),
                    "end_date": str(new_end_date),
                },
            },
        )
        assert response_update.status_code == 201
        updated_budget = response_update.json()
        assert updated_budget["amount"] == 1500.0
        assert updated_budget["period"]["start_date"] == str(new_start_date.isoformat())
        assert updated_budget["period"]["end_date"] == str(new_end_date.isoformat())

    def test_update_budget_not_found(self, client: TestClient, token_user: dict):
        # Intentar actualizar un presupuesto inexistente
        response = client.put(
            "/budgets/99999",
            headers=token_user,
            json={
                "category_id": 1,
                "amount": 1000.0,
                "period": {"start_date": "2023-01-01", "end_date": "2023-01-31"},
            },
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Budgets is not found"


@pytest.mark.budget
@pytest.mark.delete_budget
class TestDeleteBudget:

    def test_delete_budget(self, client: TestClient, token_user: dict, create_categories: tuple[int]):
        # Crear un presupuesto válido
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        response = client.post(
            "/budgets/",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "amount": 1000.0,
                "period": {
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                },
            },
        )
        assert response.status_code == 201
        budget_post = response.json()

        # Eliminar el presupuesto creado
        response_delete = client.delete(f"/budgets/{budget_post['id']}", headers=token_user)
        assert response_delete.status_code == 204

        # Intentar obtener el presupuesto eliminado
        response_get = client.get(f"/budgets/{budget_post['id']}", headers=token_user)
        assert response_get.status_code == 404
        assert response_get.json()["detail"] == "Budgets is not found"

    def test_delete_budget_not_found(self, client: TestClient, token_user: dict):
        # Intentar eliminar un presupuesto inexistente
        response = client.delete("/budgets/99999", headers=token_user)
        assert response.status_code == 404
        assert response.json()["detail"] == "Budgets is not found"
