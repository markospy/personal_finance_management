import pytest
from fastapi.testclient import TestClient

from ....schemas.schemas import TransactionType


@pytest.mark.category
@pytest.mark.create_category
class TestCategoryCreation:

    def test_create_global_category(self, client_John: TestClient, token_admin: dict):
        # Crear una categoría válida
        response = client_John.post(
            "/categories/global",
            headers=token_admin,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value},
        )
        assert response.status_code == 201
        assert response.json()["id"] == 1
        assert response.json()["name"] == "Alimentos"
        assert response.json()["type"] == TransactionType.EXPENSE.value
        assert response.json()["userId"] is None
        assert response.json()["isGlobal"] is True

    def test_create_not_global_category(self, client_John: TestClient, token_admin: dict):
        # Crear una categoría no global en la ruta para crear categorias globales
        response = client_John.post(
            "/categories/global",
            headers=token_admin,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value, "is_global": False},
        )
        assert response.status_code == 406
        assert response.json()["detail"] == "This category is not global."

    def test_create_global_category_already_exists(
        self, client_John: TestClient, token_admin: dict, global_expense_category: dict
    ):
        # Datos de categoria existente
        category_data = {
            "name": global_expense_category["name"],
            "type": global_expense_category["type"],
        }
        # Crear una categoría igual a la existente
        response = client_John.post("/categories/global", headers=token_admin, json=category_data)
        assert response.status_code == 409
        assert response.json()["detail"] == "The category is already exists"

    def test_create_user_category(self, client_John: TestClient, John_token: dict):
        # Crear una categoría válida
        response = client_John.post(
            "/categories/user",
            headers=John_token,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value, "is_global": False},
        )
        assert response.status_code == 201
        assert response.json() == {
            "id": 1,
            "name": "Alimentos",
            "type": TransactionType.EXPENSE.value,
            "userId": client_John.user["id"],
            "isGlobal": False,
        }

    def test_create_user_category_already_exists(
        self, client_John: TestClient, John_token: dict, John_income_category: dict
    ):
        # Datos de categoria existente
        category_data = {
            "name": John_income_category["name"],
            "type": John_income_category["type"],
        }
        # Crear una categoría igual a la existente
        response = client_John.post(
            "/categories/user",
            headers=John_token,
            json=category_data,
        )
        assert response.status_code == 409
        assert response.json()["detail"] == "The category is already exists"

    def test_create_not_user_category(self, client_John: TestClient, John_token: dict):
        # Crear una categoría válida
        response = client_John.post(
            "/categories/user",
            headers=John_token,
            json={
                "name": "Alimentos",
                "type": TransactionType.EXPENSE.value,
                "is_global": True,
                "user_id": client_John.user["id"],
            },
        )
        assert response.status_code == 406
        assert response.json()["detail"] == "This category is global."


@pytest.mark.category
@pytest.mark.get_category
class TestGetCategory:

    def test_get_category(
        self,
        client_John: TestClient,
        John_token: dict,
        global_expense_category: dict,
    ):
        # Obtener la categoría existente
        response = client_John.get(f"/categories/{global_expense_category["id"]}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["id"] == global_expense_category["id"]
        assert response.json()["name"] == global_expense_category["name"]
        assert response.json()["type"] == global_expense_category["type"]
        assert response.json()["userId"] == global_expense_category["userId"]
        assert response.json()["isGlobal"] == global_expense_category["isGlobal"]

    def test_get_non_existent_category(self, client_John: TestClient, John_token: dict):
        # Intentar obtener una categoría que no existe
        response = client_John.get(
            "/categories/99999",
            headers=John_token,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"


@pytest.mark.category
@pytest.mark.list_categories
class TestListCategories:

    def test_list_categories(
        self,
        client_John: TestClient,
        John_token: dict,
        global_expense_category: dict,
        John_income_category: dict,
    ):

        # Listar todas las categorías
        response = client_John.get(
            "/categories",
            headers=John_token,
        )
        assert response.status_code == 200
        assert len(response.json()) == 2

        categories = response.json()
        # Verificar que las categorías listadas son las esperadas
        print(categories[0])
        print(categories[1])
        assert any(
            [
                cat["name"] == global_expense_category["name"]
                and cat["type"] == global_expense_category["type"]
                and cat["userId"] == global_expense_category["userId"]
                and cat["isGlobal"]
                for cat in categories
            ]
        )

        assert any(
            [
                cat["name"] == John_income_category["name"]
                and cat["type"] == John_income_category["type"]
                and cat["userId"] == John_income_category["userId"]
                and not cat["isGlobal"]
                for cat in categories
            ]
        )

    def test_not_found_list_categories(self, client_John: TestClient, John_token: dict):
        # Listar todas las categorías
        response = client_John.get(
            "/categories",
            headers=John_token,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"


@pytest.mark.category
@pytest.mark.delete_category
class TestDeleteCategory:

    def test_delete_user_category(self, client_John: TestClient, John_token: dict, John_income_category: dict):
        # Eliminar la categoría creada
        response = client_John.delete(
            f"/categories/{John_income_category["id"]}/user",
            headers=John_token,
        )
        assert response.status_code == 204

        # Verificar que la categoría ya no existe
        response = client_John.get(
            f"/categories/{John_income_category["id"]}",
            headers=John_token,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"

    def test_delete_non_existent_user_category(self, client_John: TestClient, John_token: dict):
        # Intentar eliminar una categoría que no existe
        response = client_John.delete("/categories/99999/user", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"

    def test_delete_global_category(
        self,
        client_John: TestClient,
        token_admin: dict,
        John_token: dict,
        global_expense_category: dict,
    ):
        # Eliminar la categoría existente
        response = client_John.delete(
            f"/categories/{global_expense_category["id"]}/global",
            headers=token_admin,
        )
        assert response.status_code == 204

        # Verificar que la categoría ya no existe
        response = client_John.get(
            f"/categories/{global_expense_category["id"]}",
            headers=John_token,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"

    def test_delete_non_existent_global_category(self, client_John: TestClient, token_admin: dict):
        # Intentar eliminar una categoría que no existe
        response = client_John.delete(
            "/categories/99999/global",
            headers=token_admin,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"
