from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def create_expected_transaction(client_John: TestClient, John_token: dict):
    expected_transaction_data = {
        "category_id": 1,
        "amount": 100.0,
        "frequency": "monthly",  # Asegúrate de que este valor sea válido
        "date": str(datetime.now() + timedelta(days=1)),  # Asegúrate de que esta fecha sea válida
        "type": "expense",  # Asegúrate de que este valor sea válido
    }
    response = client_John.post(
        "/expected_transactions/",
        json=expected_transaction_data,
        headers=John_token,
    )
    assert response.status_code == 201
    return response.json()


@pytest.mark.expected_transaction
@pytest.mark.create_expected_transaction
class TestExpectedTransaction:

    def test_create_expected_transaction(self, client_John: TestClient, John_token: dict):
        date = datetime.now() + timedelta(days=1)
        expected_transaction_data = {
            "category_id": 1,
            "amount": 100.0,
            "frequency": "monthly",
            "date": str(date),
            "type": "expense",
        }
        response = client_John.post(
            "/expected_transactions/",
            headers=John_token,
            json=expected_transaction_data,
        )
        expected_transaction = response.json()
        assert response.status_code == 201
        assert expected_transaction["amount"] == expected_transaction_data["amount"]
        assert expected_transaction["category_id"] == expected_transaction_data["category_id"]
        assert expected_transaction["date"] == date.isoformat()
        assert expected_transaction["frequency"] == expected_transaction_data["frequency"]

    def test_create_expected_transaction_already_exists(
        self, client_John: TestClient, John_token: dict, create_expected_transaction
    ):
        # Intentar crear una transacción esperada que ya existe
        expected_transaction_data = {
            "category_id": 1,
            "amount": 100.0,
            "frequency": "monthly",
            "date": str(datetime.now() + timedelta(days=1)),
            "type": "expense",
        }
        response = client_John.post(
            "/expected_transactions/",
            headers=John_token,
            json=expected_transaction_data,
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Expected transaction already exists"


@pytest.mark.expected_transaction
@pytest.mark.get_expected_transaction
class TestGetExpectedTransaction:

    def test_get_expected_transactions(
        self,
        client_John: TestClient,
        John_token: dict,
        create_expected_transaction,
    ):
        response = client_John.get("/expected_transactions/", headers=John_token)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_expected_transactions_empty(self, client_John: TestClient, John_token: dict):
        # Asegurarse de que no hay transacciones esperadas
        response = client_John.get("/expected_transactions/", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Expected transactions not found"

    def test_get_expected_transaction(
        self,
        client_John: TestClient,
        John_token: dict,
        create_expected_transaction,
    ):
        response = client_John.get(f"/expected_transactions/{create_expected_transaction['id']}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["id"] == create_expected_transaction["id"]

    def test_get_expected_transaction_not_found(self, client_John: TestClient, John_token: dict):
        # Intentar obtener una transacción esperada que no existe
        response = client_John.get("/expected_transactions/99999", headers=John_token)  # ID que no existe
        assert response.status_code == 404
        assert response.json()["detail"] == "Expected transaction not found"


@pytest.mark.expected_transaction
@pytest.mark.update_expected_transaction
class TestUpdateExpectedTransaction:

    def test_update_expected_transaction(
        self,
        client_John: TestClient,
        John_token: dict,
        create_expected_transaction,
    ):
        updated_data = {
            "category_id": 1,
            "amount": 150.0,
            "frequency": "monthly",
            "date": str(datetime.now() + timedelta(days=1)),
            "type": "income",
        }
        response = client_John.put(
            f"/expected_transactions/{create_expected_transaction['id']}", json=updated_data, headers=John_token
        )
        assert response.status_code == 200
        assert response.json()["amount"] == updated_data["amount"]

    def test_update_expected_transaction_not_found(self, client_John: TestClient, John_token: dict):
        # Intentar actualizar una transacción esperada que no existe
        updated_data = {
            "category_id": 1,
            "amount": 150.0,
            "frequency": "monthly",
            "date": str(datetime.now() + timedelta(days=1)),
            "type": "income",
        }
        response = client_John.put(
            "/expected_transactions/99999",  # ID que no existe
            json=updated_data,
            headers=John_token,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Expected transaction not found"


@pytest.mark.expected_transaction
@pytest.mark.delete_expected_transaction
class TestDeleteExpectedTransaction:

    def test_delete_expected_transaction(
        self,
        client_John: TestClient,
        John_token: dict,
        create_expected_transaction,
    ):
        response = client_John.delete(
            f"/expected_transactions/{create_expected_transaction['id']}",
            headers=John_token,
        )
        assert response.status_code == 204

    def test_delete_expected_transaction_not_found(self, client_John: TestClient, John_token: dict):
        # Intentar eliminar una transacción esperada que no existe
        response = client_John.delete(
            "/expected_transactions/99999",  # ID que no existe
            headers=John_token,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Expected transaction not found"
