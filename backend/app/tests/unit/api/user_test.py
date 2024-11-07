import pytest
from fastapi.testclient import TestClient

from ....main import app


@pytest.fixture
def unregistered_user():
    client = TestClient(app)
    return client


@pytest.mark.user
@pytest.mark.create_user
class TestUserCreation:

    def test_create_user(self, unregistered_user: TestClient):
        response = unregistered_user.post(
            "/user/",
            json={"name": "John Doe", "email": "john@gmail.com", "password": "123456"},
        )
        assert response.status_code == 201
        assert response.json() == {"id": 1, "name": "John Doe", "email": "john@gmail.com"}

    def test_create_user_already_exists(self, unregistered_user: TestClient):
        response = unregistered_user.post(
            "/user/",
            json={"name": "John Doe", "email": "john@gmail.com", "password": "123456"},
        )
        assert response.status_code == 201

        response = unregistered_user.post(
            "/user/",
            json={"name": "John Doe", "email": "john@gmail.com", "password": "123456"},
        )

        assert response.status_code == 409
        assert response.json()["detail"] == "The user's name is already being used by another user"


@pytest.mark.user
@pytest.mark.get_user
class TestUserGet:

    def test_user_name(self, client_John: TestClient, John_token: dict):
        response = client_John.get("/user/me", headers=John_token)
        assert response.status_code == 200
        assert response.json()["name"] == client_John.user["name"]


@pytest.mark.user
@pytest.mark.delete_user
class TestUserDelete:

    def test_delete_me(self, client_John: TestClient, John_token: dict):

        # Delete the user
        response = client_John.delete("/user/me", headers=John_token)
        assert response.status_code == 204

        # Try to get the user again, should return 404
        response = client_John.get("/user/me", headers=John_token)
        assert response.status_code == 404
