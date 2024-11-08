from datetime import datetime, timedelta
from random import randint

import pytest
from fastapi.testclient import TestClient


@pytest.mark.budget
@pytest.mark.create_budget
class TestBudgetCreation:

    def test_create_budget(
        self,
        client_John: TestClient,
        John_token: dict,
        global_expense_category: dict,
    ):
        # Crear un presupuesto válido
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        response = client_John.post(
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
        assert response.status_code == 201
        budget = response.json()
        assert budget["id"] == 1
        assert budget["user_id"] == client_John.user["id"]
        assert budget["category_id"] == global_expense_category["id"]
        assert budget["amount"] == 1000.0
        assert "start_date" in budget["period"]
        assert "end_date" in budget["period"]

    def test_create_budget_invalid_category(self, client_John: TestClient, John_token: dict):
        # Intentar crear un presupuesto con una categoría inexistente
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        response = client_John.post(
            "/budgets/",
            headers=John_token,
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
        client_John: TestClient,
        John_token: dict,
        budget_John: dict,
        expense_transaction_John: dict,
    ):

        # Consultar el estado de los presupuestos
        response = client_John.get(f"/budgets/{budget_John["id"]}/status", headers=John_token)
        assert response.status_code == 200
        data = response.json()

        # Verificar la respuesta
        assert data["category_id"] == budget_John["category_id"]
        assert data["budget_amount"] == 1000.0
        assert data["spent_amount"] == 200.0
        assert data["remaining_amount"] == 800.0
        assert not data["is_exceeded"]

    def test_create_budget_already_exists(
        self, client_John: TestClient, John_token: dict, global_expense_category: dict
    ):
        # Crear un presupuesto válido
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        response = client_John.post(
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
        assert response.status_code == 201  # Asegúrate de que el presupuesto se creó correctamente

        # Intentar crear el mismo presupuesto nuevamente
        response_duplicate = client_John.post(
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
        assert response_duplicate.status_code == 409  # Debe devolver un conflicto
        assert response_duplicate.json()["detail"] == "The budget is already exists"


@pytest.mark.budget
@pytest.mark.get_budget
class TestGetBudget:

    def test_get_all_budgets(
        self,
        client_John: TestClient,
        John_token: dict,
        global_expense_category: dict,
        John_income_category: dict,
    ):
        # Crear varios presupuestos
        for category in [global_expense_category, John_income_category]:
            start_date = datetime.now()
            end_date = start_date + timedelta(days=30)
            response = client_John.post(
                "/budgets/",
                headers=John_token,
                json={
                    "category_id": category["id"],
                    "amount": 1000.0 + randint(0, 1000),  # Diferentes montos para cada presupuesto
                    "period": {
                        "start_date": str(start_date),
                        "end_date": str(end_date),
                    },
                },
            )
            assert response.status_code == 201

        # Obtener todos los presupuestos
        response_get = client_John.get("/budgets/", headers=John_token)
        assert response_get.status_code == 200
        budgets = response_get.json()
        assert isinstance(budgets, list)  # Verificar que la respuesta sea una lista
        assert len(budgets) == 2  # Verificar que se hayan creado 2 presupuestos

        # Verificar que cada presupuesto tenga los campos esperados
        for budget in budgets:
            assert "id" in budget
            assert "user_id" in budget
            assert "category_id" in budget
            assert "amount" in budget
            assert "period" in budget
            assert "start_date" in budget["period"]
            assert "end_date" in budget["period"]

    def test_get_all_budgets_not_found(self, client_John: TestClient, John_token: dict):
        response = client_John.get("/budgets/", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Budgets is not found"

    def test_get_one_budget(
        self,
        client_John: TestClient,
        John_token: dict,
        global_expense_category: dict,
        budget_John: dict,
    ):
        response_budget = client_John.get(f"/budgets/{budget_John["id"]}", headers=John_token)
        budget = response_budget.json()
        assert response_budget.status_code == 200
        assert budget["id"] == 1
        assert budget["user_id"] == client_John.user["id"]
        assert budget["category_id"] == global_expense_category["id"]
        assert budget["amount"] == 1000
        assert budget["period"]["start_date"] == budget_John["period"]["start_date"]
        assert budget["period"]["end_date"] == budget_John["period"]["end_date"]

    def test_get_one_budget_not_found(self, client_John: TestClient, John_token: dict):
        response = client_John.get("/budgets/1", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Budget is not found"

    def test_get_status_of_budget_not_found(self, client_John: TestClient, John_token: dict):
        # Intentar obtener un presupuesto que no pertenece al usuario actual
        response = client_John.get("/budgets/1/status", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Budget is not found"


@pytest.mark.budget
@pytest.mark.update_budget
class TestUpdateBudget:

    def test_update_budget(
        self,
        client_John: TestClient,
        John_token: dict,
        income_transaction_John: dict,
        budget_John: dict,
    ):

        # Actualizar el presupuesto creado
        new_start_date = datetime.now() + timedelta(days=1)
        new_end_date = new_start_date + timedelta(days=29)
        response_update = client_John.put(
            f"/budgets/{budget_John['id']}",
            headers=John_token,
            json={
                "category_id": income_transaction_John["id"],
                "amount": 1500.0,
                "period": {
                    "start_date": str(new_start_date),
                    "end_date": str(new_end_date),
                },
            },
        )
        assert response_update.status_code == 201
        updated_budget = response_update.json()
        assert updated_budget["id"] == 1
        assert updated_budget["category_id"] == income_transaction_John["id"]
        assert updated_budget["user_id"] == client_John.user["id"]
        assert updated_budget["amount"] == 1500.0
        assert updated_budget["period"]["start_date"] == str(new_start_date.isoformat())
        assert updated_budget["period"]["end_date"] == str(new_end_date.isoformat())

    def test_update_budget_not_found(self, client_John: TestClient, John_token: dict):
        # Intentar actualizar un presupuesto inexistente
        response = client_John.put(
            "/budgets/99999",
            headers=John_token,
            json={
                "category_id": 1,
                "amount": 1000.0,
                "period": {"start_date": "2023-01-01", "end_date": "2023-01-31"},
            },
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Budget is not found"


@pytest.mark.budget
@pytest.mark.delete_budget
class TestDeleteBudget:

    def test_delete_budget(
        self,
        client_John: TestClient,
        John_token: dict,
        budget_John: dict,
    ):

        # Eliminar el presupuesto creado
        response_delete = client_John.delete(f"/budgets/{budget_John['id']}", headers=John_token)
        assert response_delete.status_code == 204

        # Intentar obtener el presupuesto eliminado
        response_get = client_John.get(f"/budgets/{budget_John['id']}", headers=John_token)
        assert response_get.status_code == 404
        assert response_get.json()["detail"] == "Budget is not found"

    def test_delete_budget_not_found(self, client_John: TestClient, John_token: dict):
        # Intentar eliminar un presupuesto inexistente
        response = client_John.delete("/budgets/99999", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Budget is not found"
