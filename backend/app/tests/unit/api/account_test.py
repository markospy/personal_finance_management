import pytest
from fastapi.testclient import TestClient


@pytest.mark.account
@pytest.mark.create_account
class TestAccountCreation:

    def test_create_account(self, client: TestClient, token_user: dict):
        # Crear una cuenta válida
        response = client.post(
            "/accounts/",
            headers=token_user,
            json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
        )
        assert response.status_code == 201
        assert response.json() == {
            "id": 1,
            "user_id": client.user["id"],
            "name": "Cuenta Ahorros",
            "currency": "USD",
            "balance": 5000,
        }

    def test_create_account_with_invalid_currency(self, client: TestClient, token_user: dict):
        # Intentar crear una cuenta con una moneda inválida
        response = client.post(
            "/accounts/",
            headers=token_user,
            json={"name": "Cuenta Ahorros", "currency": "INVALID_CURRENCY", "balance": 5000},
        )
        assert response.status_code == 422
        assert "String should have" in response.json()["detail"][0]["msg"]

    def test_create_account_without_name(self, client: TestClient, token_user: dict):
        # Intentar crear una cuenta sin el campo "name"
        response = client.post(
            "/accounts/",
            headers=token_user,
            json={"currency": "USD", "balance": 5000},
        )
        assert response.status_code == 422
        assert response.json()["detail"][0]["msg"] == "Field required"

    def test_create_account_balance_below_zero(self, client: TestClient, token_user: dict):
        # Intentar crear una cuenta con un balance negativo
        response = client.post(
            "/accounts/",
            headers=token_user,
            json={"name": "Cuenta Corriente", "currency": "USD", "balance": -100},
        )
        assert response.status_code == 422
        assert response.json()["detail"][0]["msg"] == "Input should be greater than or equal to 0"


@pytest.mark.account
@pytest.mark.get_account
class TestGetAccount:

    def test_get_account(self, client: TestClient, token_user: dict):
        # Crear una cuenta primero
        response = client.post(
            "/accounts/",
            headers=token_user,
            json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
        )
        assert response.status_code == 201
        account_id = response.json()["id"]

        # Obtener la cuenta creada
        response = client.get(f"/accounts/{account_id}", headers=token_user)
        assert response.status_code == 200
        assert response.json() == {
            "id": account_id,
            "user_id": client.user["id"],
            "name": "Cuenta Ahorros",
            "currency": "USD",
            "balance": 5000,
        }

    def test_get_non_existent_account(self, client: TestClient, token_user: dict):
        # Intentar obtener una cuenta inexistente
        response = client.get("/accounts/99999", headers=token_user)
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"


@pytest.mark.account
@pytest.mark.list_accounts
class TestListAccounts:

    def test_list_accounts(self, client: TestClient, token_user: dict):
        # Crear múltiples cuentas
        response = client.post(
            "/accounts/",
            headers=token_user,
            json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
        )
        assert response.status_code == 201
        response = client.post(
            "/accounts/",
            headers=token_user,
            json={"name": "Cuenta Corriente", "currency": "EUR", "balance": 1000},
        )
        assert response.status_code == 201
        # Listar todas las cuentas del usuario
        response = client.get("/accounts/", headers=token_user)
        assert response.status_code == 200
        assert len(response.json()) == 2
        assert response.json() == [
            {"currency": "USD", "balance": 5000, "name": "Cuenta Ahorros", "id": 1, "user_id": 1},
            {"currency": "EUR", "balance": 1000, "name": "Cuenta Corriente", "id": 2, "user_id": 1},
        ]

    def test_list_accounts_no_accounts(self, client: TestClient, token_user: dict):
        # Listar todas las cuentas del usuario (should raise 404)
        response = client.get("/accounts/", headers=token_user)
        assert response.status_code == 404


@pytest.mark.account
@pytest.mark.delete_account
class TestDeleteAccount:

    def test_delete_account(self, client: TestClient, token_user: dict):
        # Crear una cuenta primero
        response = client.post(
            "/accounts/",
            headers=token_user,
            json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
        )
        assert response.status_code == 201
        account_id = response.json()["id"]

        # Eliminar la cuenta creada
        response = client.delete(f"/accounts/{account_id}", headers=token_user)
        assert response.status_code == 204  # Código de éxito esperado para eliminación

        # Verificar que la cuenta ya no existe
        response = client.get(f"/accounts/{account_id}", headers=token_user)
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"

    def test_delete_non_existent_account(self, client: TestClient, token_user: dict):
        # Intentar eliminar una cuenta que no existe
        response = client.delete("/accounts/99999", headers=token_user)
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"
