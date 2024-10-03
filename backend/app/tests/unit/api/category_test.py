import pytest
from fastapi.testclient import TestClient

from ....schemas.schemas import TransactionType


@pytest.mark.category
@pytest.mark.create_category
class TestCategoryCreation:

    def test_create_global_category(self, client: TestClient, token: dict):
        # Crear una categoría válida
        response = client.post(
            "/category/",
            headers=token,
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

    def test_create_users_category(self, client: TestClient, token: dict):
        # Crear una categoría válida
        response = client.post(
            "/category/",
            headers=token,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value, "user_id": client.user["id"]},
        )
        assert response.status_code == 201
        assert response.json() == {
            "id": 1,
            "name": "Alimentos",
            "type": TransactionType.EXPENSE.value,
            "user_id": client.user["id"],
            "is_global": False,
        }

    def test_create_category_without_name(self, client: TestClient, token: dict):
        # Intentar crear una categoría sin nombre
        response = client.post(
            "/category/",
            headers=token,
            json={"type": TransactionType.EXPENSE.value},
        )
        assert response.status_code == 422
        assert response.json()["detail"][0]["msg"] == "Field required"

    def test_create_category_without_type(self, client: TestClient, token: dict):
        # Intentar crear una categoría sin nombre
        response = client.post(
            "/category/",
            headers=token,
            json={"name": "Nexflix"},
        )
        assert response.status_code == 422
        assert response.json()["detail"][0]["msg"] == "Field required"

    def test_create_category_with_invalid_type(self, client: TestClient, token: dict):
        # Intentar crear una categoría con un tipo no válido
        response = client.post(
            "/category/",
            headers=token,
            json={"name": "Transporte", "type": "other"},
        )
        assert response.status_code == 422
        assert (
            response.json()["detail"][0]["msg"]
            == "value is not a valid enumeration member; permitted: 'expense', 'income'"
        )


@pytest.mark.category
@pytest.mark.get_category
class TestGetCategory:

    def test_get_category(self, client: TestClient, token: dict):
        # Crear una categoría
        category_response = client.post(
            "/category/",
            headers=token,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value},
        )
        assert category_response.status_code == 201
        category_id = category_response.json()["id"]

        # Obtener la categoría creada
        response = client.get(f"/category/{category_id}")
        assert response.status_code == 200
        assert response.json() == {
            "id": 1,
            "name": "Alimentos",
            "type": TransactionType.EXPENSE.value,
            "user_id": None,
            "is_global": True,
        }

    def test_get_non_existent_category(self, client: TestClient, token: dict):
        # Intentar obtener una categoría que no existe
        response = client.get(
            "/category/99999",
            headers=token,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"


@pytest.mark.category
@pytest.mark.list_categories
class TestListCategories:

    def test_list_categories(self, client: TestClient, token: dict):
        # Crear varias categorías
        client.post("/category/", headers=token, json={"name": "Alimentos", "type": TransactionType.EXPENSE.value})
        client.post("/category/", headers=token, json={"name": "Transporte", "type": TransactionType.EXPENSE.value})
        client.post("/category/", headers=token, json={"name": "Salario", "type": TransactionType.INCOME.value})

        # Listar todas las categorías
        response = client.get(
            "/category/",
            headers=token,
        )
        assert response.status_code == 200
        assert len(response.json()) == 3
        assert response.json() == [
            {"id": 1, "name": "Alimentos", "type": TransactionType.EXPENSE.value, "user_id": None, "is_global": True},
            {
                "id": 2,
                "name": "Transporte",
                "type": TransactionType.EXPENSE.value,
                "user_id": None,
                "is_global": True,
            },
            {"id": 3, "name": "Salario", "type": TransactionType.INCOME.value, "user_id": None, "is_global": True},
        ]

    def test_list_users_categories(self, client: TestClient, token: dict):
        # Crear varias categorías
        client.post(
            "/category/", headers=token, json={"name": "Alimentos", "type": TransactionType.EXPENSE.value}
        )  # global category
        client.post(
            "/category/",
            headers=token,
            json={
                "name": "Transporte",
                "type": TransactionType.EXPENSE.value,
                "user_id": client.user["id"],
                "is_global": False,
            },
        )  # user category
        client.post(
            "/category/",
            headers=token,
            json={
                "name": "Salario",
                "type": TransactionType.INCOME.value,
                "user_id": client.user["id"],
                "is_global": False,
            },
        )  # user category

        # Listar todas las categorías
        response = client.get(
            "/category/",
            headers=token,
        )
        assert response.status_code == 200
        assert len(response.json()) == 3
        assert response.json() == [
            {"id": 1, "name": "Alimentos", "type": TransactionType.EXPENSE.value, "user_id": None, "is_global": True},
            {
                "id": 2,
                "name": "Transporte",
                "type": TransactionType.EXPENSE.value,
                "user_id": client.user["id"],
                "is_global": False,
            },
            {
                "id": 3,
                "name": "Salario",
                "type": TransactionType.INCOME.value,
                "user_id": client.user["id"],
                "is_global": False,
            },
        ]


@pytest.mark.category
@pytest.mark.delete_category
class TestDeleteCategory:

    def test_delete_category(self, client: TestClient, token: dict):
        # Crear una categoría
        category_response = client.post(
            "/category/",
            headers=token,
            json={"name": "Alimentos", "type": TransactionType.EXPENSE.value},
        )
        assert category_response.status_code == 201
        category_id = category_response.json()["id"]

        # Eliminar la categoría creada
        response = client.delete(
            f"/category/{category_id}",
            headers=token,
        )
        assert response.status_code == 204

        # Verificar que la categoría ya no existe
        response = client.get(
            f"/category/{category_id}",
            headers=token,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"

    def test_delete_non_existent_category(self, client: TestClient, token: dict):
        # Intentar eliminar una categoría que no existe
        response = client.delete(
            "/category/99999",
            headers=token,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"
