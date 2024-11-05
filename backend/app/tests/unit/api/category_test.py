import pytest
from fastapi.testclient import TestClient

from ....schemas.schemas import TransactionType


@pytest.mark.category
@pytest.mark.create_category
class TestCategoryCreation:

    def test_create_global_category(self, client: TestClient, token_admin: dict):
        # Crear una categoría válida
        response = client.post(
            "/categories/global",
            headers=token_admin,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value},
        )
        assert response.status_code == 201
        assert response.json() == {
            "id": 1,
            "name": "Alimentos",
            "type": TransactionType.EXPENSE.value,
            "user_id": None,
            "is_global": True,
        }

    def test_create_not_global_category(self, client: TestClient, token_admin: dict):
        # Crear una categoría no global en la ruta para crear categorias globales
        response = client.post(
            "/categories/global",
            headers=token_admin,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value, "is_global": False},
        )
        assert response.status_code == 406
        assert response.json()["detail"] == "This category is not global."

    def test_create_global_category_already_exists(self, client: TestClient, token_admin: dict):
        # Crear una categoría válida
        response = client.post(
            "/categories/global",
            headers=token_admin,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value},
        )
        assert response.status_code == 201
        response = client.post(
            "/categories/global",
            headers=token_admin,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value},
        )
        assert response.status_code == 409
        assert response.json()["detail"] == "The category is already exists"

    def test_create_user_category(self, client: TestClient, token_user: dict):
        # Crear una categoría válida
        response = client.post(
            "/categories/user",
            headers=token_user,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value, "is_global": False},
        )
        assert response.status_code == 201
        assert response.json() == {
            "id": 1,
            "name": "Alimentos",
            "type": TransactionType.EXPENSE.value,
            "user_id": client.user["id"],
            "is_global": False,
        }

    def test_create_user_category_already_exists(self, client: TestClient, token_user: dict):
        # Crear una categoría válida
        response = client.post(
            "/categories/user",
            headers=token_user,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value, "is_global": False},
        )
        assert response.status_code == 201
        response = client.post(
            "/categories/user",
            headers=token_user,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value, "is_global": False},
        )
        assert response.status_code == 409
        assert response.json()["detail"] == "The category is already exists"

    def test_create_not_user_category(self, client: TestClient, token_user: dict):
        # Crear una categoría válida
        response = client.post(
            "/categories/user",
            headers=token_user,
            json={
                "name": "Alimentos",
                "type": TransactionType.EXPENSE.value,
                "is_global": True,
                "user_id": client.user["id"],
            },
        )
        assert response.status_code == 406
        assert response.json()["detail"] == "This category is global."


@pytest.mark.category
@pytest.mark.get_category
class TestGetCategory:

    def test_get_category(self, client: TestClient, token_admin: dict, token_user: dict):
        # Crear una categoría
        category_response = client.post(
            "/categories/global",
            headers=token_admin,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value},
        )
        assert category_response.status_code == 201
        category_id = category_response.json()["id"]

        # Obtener la categoría creada
        response = client.get(f"/categories/{category_id}", headers=token_user)
        assert response.status_code == 200
        assert response.json() == {
            "id": category_id,
            "name": "Alimentos",
            "type": TransactionType.EXPENSE.value,
            "user_id": None,
            "is_global": True,
        }

    def test_get_non_existent_category(self, client: TestClient, token_user: dict):
        # Intentar obtener una categoría que no existe
        response = client.get(
            "/categories/99999",
            headers=token_user,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"


@pytest.mark.category
@pytest.mark.list_categories
class TestListCategories:

    def test_list_categories(self, client: TestClient, token_user: dict, token_admin: dict):
        # Crear varias categorías
        response = client.post(
            "/categories/global",
            headers=token_admin,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value},
        )
        assert response.status_code == 201

        response = client.post(
            "/categories/user",
            headers=token_user,
            json={"name": "Cine", "type": TransactionType.EXPENSE.value, "is_global": False},
        )
        assert response.status_code == 201

        response = client.post(
            "/categories/user",
            headers=token_user,
            json={"name": "Coche", "type": TransactionType.EXPENSE.value, "is_global": False},
        )
        assert response.status_code == 201

        # Listar todas las categorías
        response = client.get(
            "/categories",
            headers=token_user,
        )
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_not_found_list_categories(self, client: TestClient, token_user: dict):
        # Listar todas las categorías
        response = client.get(
            "/categories",
            headers=token_user,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"


@pytest.mark.category
@pytest.mark.delete_category
class TestDeleteCategory:

    def test_delete_user_category(self, client: TestClient, token_user: dict):
        # Crear una categoría
        category_response = client.post(
            "/categories/user",
            headers=token_user,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value, "is_global": False},
        )
        assert category_response.status_code == 201
        category_id = category_response.json()["id"]

        # Eliminar la categoría creada
        response = client.delete(
            f"/categories/{category_id}/user",
            headers=token_user,
        )
        assert response.status_code == 204

        # Verificar que la categoría ya no existe
        response = client.get(
            f"/categories/{category_id}",
            headers=token_user,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"

    def test_delete_non_existent_user_category(self, client: TestClient, token_user: dict):
        # Intentar eliminar una categoría que no existe
        response = client.delete(
            "/categories/99999/user",
            headers=token_user,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"

    def test_delete_global_category(self, client: TestClient, token_admin: dict, token_user: dict):
        # Crear una categoría
        category_response = client.post(
            "/categories/global",
            headers=token_admin,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value},
        )
        assert category_response.status_code == 201
        category_id = category_response.json()["id"]

        # Eliminar la categoría creada
        response = client.delete(
            f"/categories/{category_id}/global",
            headers=token_admin,
        )
        assert response.status_code == 204

        # Verificar que la categoría ya no existe
        response = client.get(
            f"/categories/{category_id}",
            headers=token_user,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"

    def test_delete_non_existent_global_category(self, client: TestClient, token_admin: dict):
        # Intentar eliminar una categoría que no existe
        response = client.delete(
            "/categories/99999/global",
            headers=token_admin,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"
