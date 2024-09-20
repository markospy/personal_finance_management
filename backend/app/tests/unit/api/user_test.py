import pytest
from fastapi.testclient import TestClient

from ....main import app


@pytest.fixture()
def client():
    client = TestClient(app)
    return client


@pytest.mark.user
@pytest.mark.create_user
class TestUserCreation:

    def test_create_user(self, client: TestClient):
        response = client.post(
            "/user/",
            json={"name": "Marcos", "email": "marcos@gmail.com", "password": "123456"},
        )
        assert response.status_code == 201
        assert response.json() == {"id": 1, "name": "Marcos", "email": "marcos@gmail.com"}

    def test_create_user_name_less_than_2_letters(self, client: TestClient):
        response = client.post(
            "/user/",
            json={"name": "M", "email": "marcos@gmail.com", "password": "123456"},
        )
        assert response.status_code == 422
        assert response.json()["detail"][0]["msg"] == "String should have at least 2 characters"

    def test_create_user_non_existent_name(self, client: TestClient):
        response = client.post(
            "/user/",
            json={"email": "marcos@gmail.com", "password": "123456"},
        )
        assert response.status_code == 422
        assert response.json()["detail"][0]["msg"] == "Field required"

    def test_create_user_invalid_email(self, client: TestClient):
        response = client.post(
            "/user/",
            json={"name": "Marcos", "email": "invalid_email", "password": "123456"},
        )
        assert response.status_code == 422
        assert (
            response.json()["detail"][0]["msg"]
            == "value is not a valid email address: An email address must have an @-sign."
        )

    def test_create_user_password_less_than_6_characters(self, client: TestClient):
        response = client.post(
            "/user/",
            json={"name": "Marcos", "email": "marcos@gmail.com", "password": "123"},
        )
        assert response.status_code == 422
        assert response.json()["detail"][0]["msg"] == "String should have at least 6 characters"

    def test_create_user_already_exists(self, client: TestClient):
        response = client.post(
            "/user/",
            json={"name": "Marcos", "email": "marcos@gmail.com", "password": "123456"},
        )
        assert response.status_code == 201

        response = client.post(
            "/user/",
            json={"name": "Marcos", "email": "marcos@gmail.com", "password": "123456"},
        )

        assert response.status_code == 400
        assert response.json()["detail"] == "User already exists"
