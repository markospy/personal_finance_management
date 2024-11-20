import pytest
from fastapi.testclient import TestClient


@pytest.mark.account
@pytest.mark.create_account
class TestAccountCreation:

    def test_create_account(self, client_John: TestClient, John_token: dict):
        # Crear una cuenta válida
        response = client_John.post(
            "/accounts/",
            headers=John_token,
            json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
        )
        assert response.status_code == 201
        assert response.json()["id"] == 1
        assert response.json()["userId"] == client_John.user["id"]
        assert response.json()["name"] == "Cuenta Ahorros"
        assert response.json()["currency"] == "USD"
        assert response.json()["balance"] == 5000

    def test_create_account_already_exists(
        self,
        client_John: TestClient,
        John_token: dict,
        account_John: dict,
    ):
        # Datos de la cuenta existente
        account_data = {
            "currency": account_John["currency"],
            "balance": 900,
            "name": account_John["name"],
        }

        # Intentar crear la misma cuenta nuevamente
        response = client_John.post("/accounts/", headers=John_token, json=account_data)
        assert response.status_code == 409
        assert response.json()["detail"] == "Account is already exists"


@pytest.mark.account
@pytest.mark.get_account
class TestGetAccount:

    def test_get_account(self, client_John: TestClient, John_token: dict):
        # Crear una cuenta primero
        response = client_John.post(
            "/accounts/",
            headers=John_token,
            json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
        )
        assert response.status_code == 201
        account_id = response.json()["id"]

        # Obtener la cuenta creada
        response = client_John.get(f"/accounts/{account_id}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["id"] == account_id
        assert response.json()["userId"] == client_John.user["id"]
        assert response.json()["name"] == "Cuenta Ahorros"
        assert response.json()["currency"] == "USD"
        assert response.json()["balance"] == 5000

    def test_get_non_existent_account(self, client_John: TestClient, John_token: dict):
        # Intentar obtener una cuenta inexistente
        response = client_John.get("/accounts/99999", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"


@pytest.mark.account
@pytest.mark.list_accounts
class TestListAccounts:

    def test_list_accounts(self, client_John: TestClient, John_token: dict, account_John: dict):
        # Crear una segunda cuenta
        response = client_John.post(
            "/accounts/",
            headers=John_token,
            json={"name": "Cuenta Corriente", "currency": "EUR", "balance": 1000},
        )
        assert response.status_code == 201
        id_second_account = response.json()["id"]

        # Listar todas las cuentas del usuario
        response = client_John.get("/accounts/", headers=John_token)
        assert response.status_code == 200
        assert len(response.json()) == 2
        first_account, second_account = account_John, response.json()[1]

        assert first_account["id"] == account_John["id"]
        assert first_account["userId"] == client_John.user["id"]
        assert first_account["name"] == account_John["name"]
        assert first_account["currency"] == account_John["currency"]
        assert first_account["balance"] == account_John["balance"]

        assert second_account["id"] == id_second_account
        assert second_account["userId"] == client_John.user["id"]
        assert second_account["name"] == "Cuenta Corriente"
        assert second_account["currency"] == "EUR"
        assert second_account["balance"] == 1000

    def test_list_accounts_not_found(self, client_John: TestClient, John_token: dict):
        # Listar todas las cuentas de un usuario sin cuentas
        response = client_John.get("/accounts/", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Accounts not found"


@pytest.mark.account
@pytest.mark.delete_account
class TestDeleteAccount:

    def test_delete_account(
        self,
        client_John: TestClient,
        John_token: dict,
        account_John: dict,
    ):

        # Eliminar la cuenta
        response = client_John.delete(f"/accounts/{account_John["id"]}", headers=John_token)
        assert response.status_code == 204  # Código de éxito esperado para eliminación

        # Verificar que la cuenta ya no existe
        response = client_John.get(f"/accounts/{account_John["id"]}", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"

    def test_delete_non_existent_account(self, client_John: TestClient, John_token: dict):
        # Intentar eliminar una cuenta que no existe
        response = client_John.delete("/accounts/99999", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"
