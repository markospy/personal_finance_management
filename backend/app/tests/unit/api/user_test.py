import pytest
from fastapi.testclient import TestClient

from ....main import app


@pytest.fixture
def client_some():
    client = TestClient(app)
    return client


@pytest.mark.user
@pytest.mark.create_user
class TestUserCreation:

    def test_create_user(self, client_some: TestClient):
        response = client_some.post(
            "/user/",
            json={"name": "Jane Doe", "email": "john@gmail.com", "password": "123456"},
        )
        assert response.status_code == 201
        assert response.json() == {"id": 1, "name": "Jane Doe", "email": "john@gmail.com"}

    def test_create_user_non_existent_name(self, client_some: TestClient):
        response = client_some.post(
            "/user/",
            json={"email": "john@gmail.com", "password": "123456"},
        )
        assert response.status_code == 422
        assert response.json()["detail"][0]["msg"] == "Field required"

    def test_create_user_already_exists(self, client_some: TestClient):
        response = client_some.post(
            "/user/",
            json={"name": "Jane Doe", "email": "john@gmail.com", "password": "123456"},
        )
        assert response.status_code == 201

        response = client_some.post(
            "/user/",
            json={"name": "Jane Doe", "email": "john@gmail.com", "password": "123456"},
        )

        assert response.status_code == 409
        assert response.json()["detail"] == "The user's name is already being used by another user"


class TestUserGet:

    def test_user_name(self, client: TestClient, token_user: dict):
        response = client.get("/user/me", headers=token_user)
        assert response.status_code == 200
        assert response.json()["name"] == client.user["name"]


class TestUserDelete:

    def test_delete_me(self, client: TestClient, token_user: dict):

        # Delete the user
        response = client.delete("/user/me", headers=token_user)
        assert response.status_code == 204

        # Try to get the user again, should return 404
        response = client.get("/user/me", headers=token_user)
        assert response.status_code == 404
