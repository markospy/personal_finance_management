from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from ....schemas.schemas import TransactionType


@pytest.fixture
def create_account(client: TestClient, token_user: dict):
    # Crear una cuenta de prueba para el usuario
    response = client.post(
        "/accounts/",
        headers=token_user,
        json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
    )
    assert response.status_code == 201
    return response.json()["id"]


@pytest.fixture
def create_account_of_other_user(other_client: TestClient, other_token_user: dict):
    # Crear una cuenta de prueba para el usuario
    response = other_client.post(
        "/accounts/",
        headers=other_token_user,
        json={"name": "Cuenta Ahorros", "currency": "USD", "balance": 5000},
    )
    assert response.status_code == 201
    return response.json()["id"]


@pytest.fixture
def create_categories(client: TestClient, token_admin: dict, token_user: dict):
    # Crear categorías de prueba para el administrador y el usuario
    global_category = client.post(
        "/categories/global",
        headers=token_admin,
        json={"name": "Categoría global", "type": TransactionType.EXPENSE.value},
    )

    user_category = client.post(
        "/categories/user",
        headers=token_user,
        json={
            "name": "Categoría de usuario",
            "type": TransactionType.INCOME.value,
            "is_global": False,
        },
    )
    return (global_category.json()["id"], user_category.json()["id"])


@pytest.fixture
def create_transactions(
    client: TestClient,
    token_user: dict,
    create_account: int,
    create_categories: tuple[int],
):
    date = str(datetime.now())
    transaction_1 = client.post(
        "/transactions",
        headers=token_user,
        json={
            "category_id": create_categories[0],
            "account_id": create_account,
            "amount": 200.0,
            "date": date,
            "comments": "Pago de servicios",
        },
    )
    assert transaction_1.status_code == 201

    transaction_2 = client.post(
        "/transactions",
        headers=token_user,
        json={
            "category_id": create_categories[1],
            "account_id": create_account,
            "amount": 200.0,
            "date": date,
            "comments": "Cobro de servicios",
        },
    )
    assert transaction_2.status_code == 201
    return (transaction_1.json()["id"], transaction_2.json()["id"])


@pytest.fixture
def create_transactions_other_user(
    other_client: TestClient,
    other_token_user: dict,
    create_account_of_other_user: int,
    create_categories: tuple[int],
):
    date = str(datetime.now())
    transaction = other_client.post(
        "/transactions",
        headers=other_token_user,
        json={
            "category_id": create_categories[0],
            "account_id": create_account_of_other_user,
            "amount": 200.0,
            "date": date,
            "comments": "Pago de servicios",
        },
    )
    assert transaction.status_code == 201
    return transaction.json()["id"]


@pytest.mark.transaction
@pytest.mark.create_transaction
class TestCreateTransactions:

    def test_create_expense_transaction(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_categories: tuple[int],
    ):
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        # Asumir que existe un presupuesto para la categoría con un límite de 500
        budget_response = client.post(
            "/budgets/",
            json={
                "category_id": create_categories[0],
                "amount": 500.0,
                "period": {
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                },
            },
            headers=token_user,
        )
        assert budget_response.status_code == 201

        date = str(start_date)
        date_isoformat = datetime.strptime(date, "%Y-%m-%d %H:%M:%S.%f").isoformat()
        response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "account_id": create_account,
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 201
        transaction = response.json()
        assert transaction["category_id"] == create_categories[0]
        assert transaction["account_id"] == create_account
        assert transaction["amount"] == 200.0
        assert transaction["date"] == date_isoformat
        assert transaction["comments"] == "Pago de servicios"

        response = client.get(f"/accounts/{create_account}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 4800

    def test_create_income_transaction(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_categories: tuple[int],
    ):
        date = str(datetime.now())
        date_isoformat = datetime.strptime(date, "%Y-%m-%d %H:%M:%S.%f").isoformat()
        response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": create_categories[1],
                "account_id": create_account,
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 201
        transaction = response.json()
        assert transaction["category_id"] == create_categories[1]
        assert transaction["account_id"] == create_account
        assert transaction["amount"] == 200.0
        assert transaction["date"] == date_isoformat
        assert transaction["comments"] == "Pago de servicios"

        response = client.get(f"/accounts/{create_account}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 5200

    def test_create_transaction_invalid_category(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
    ):
        date = str(datetime.now())
        response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": 999,  # Non-existent category ID
                "account_id": create_account,
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"

    def test_create_transaction_invalid_account(
        self,
        client: TestClient,
        token_user: dict,
        create_categories: tuple[int],
    ):
        date = str(datetime.now())
        response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "account_id": 999,  # Non-existent account ID
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"

    def test_create_transaction_insufficient_funds(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_categories: tuple[int],
    ):
        date = str(datetime.now())
        response = client.post(
            "/transactions",
            headers=token_user,
            json={
                "category_id": create_categories[0],
                "account_id": create_account,
                "amount": 6000.0,  # Monto que excede el balance
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Insufficient funds"

    def test_create_transaction_exceeding_budget(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_categories: tuple[int],
    ):
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        # Asumir que existe un presupuesto para la categoría con un límite de 500
        budget_response = client.post(
            "/budgets/",
            json={
                "category_id": create_categories[0],
                "amount": 500.0,
                "period": {
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                },
            },
            headers=token_user,
        )
        assert budget_response.status_code == 201

        date = str(datetime.now())
        # Crear una transacción que excede el presupuesto
        response = client.post(
            "/transactions/",
            json={
                "category_id": create_categories[0],
                "account_id": create_account,
                "amount": 600.0,
                "date": date,
                "comments": "Compra grande",
                "type": "Expense",
            },
            headers=token_user,
            cookies={"strict": "true"},
        )
        assert response.status_code == 409
        data = response.json()
        assert "warning" in data
        assert "Transacción cancelada." in data["warning"]


@pytest.mark.transaction
@pytest.mark.get_transaction
@pytest.mark.list_transaction
class TestGetTransactions:

    def test_get_all_transactions(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):

        # Obtener todas las transacciones del usuario
        response = client.get("/transactions/", headers=token_user)
        assert response.status_code == 200
        transactions = response.json()
        assert isinstance(transactions, list)
        assert len(transactions) == len(create_transactions)

    def test_transactions_not_founds(
        self,
        client: TestClient,
        token_user: dict,
    ):

        # Obtener todas las transacciones del usuario
        response = client.get("/transactions/", headers=token_user)
        assert response.status_code == 404
        assert response.json()["detail"] == "Transactions not found"

    def test_get_transactions_by_account(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_transactions: tuple[int],
    ):

        response = client.get(f"/transactions/account/{create_account}", headers=token_user)
        assert response.status_code == 200
        transactions = response.json()
        assert isinstance(transactions, list)
        for transaction in transactions:
            assert transaction["account_id"] == create_account

    def test_get_transactions_by_account_not_found(
        self,
        client: TestClient,
        token_user: dict,
    ):

        response = client.get("/transactions/account/999", headers=token_user)
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"

    def test_get_transaction_by_id(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):
        # Obtener una transacción específica por su ID
        response = client.get(f"/transactions/{create_transactions[1]}", headers=token_user)
        assert response.status_code == 200
        transaction = response.json()
        assert transaction["id"] == create_transactions[1]
        assert transaction["amount"] == 200.0  # Ajusta esto al monto de la transacción creada
        assert transaction["comments"] == "Cobro de servicios"  # Ajusta esto según el comentario de la transacción

    def test_get_transaction_not_found(
        self,
        client: TestClient,
        token_user: dict,
    ):
        # Intentar obtener una transacción con un ID inexistente
        transaction_id = 999  # ID de transacción inexistente
        response = client.get(f"/transactions/{transaction_id}", headers=token_user)
        assert response.status_code == 404
        assert response.json()["detail"] == "Transaction not found"


@pytest.mark.transaction
@pytest.mark.update_transaction
class TestUpdateTransaction:

    def test_update_last_transaction(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": 1,  # Asegúrate de que esta categoría existe
            "account_id": 1,  # Asegúrate de que esta cuenta existe
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client.put(f"/transactions/{create_transactions[1]}", headers=token_user, json=updated_data)
        assert response.status_code == 200
        updated_transaction = response.json()
        assert updated_transaction["id"] == create_transactions[1]
        assert updated_transaction["amount"] == 250.0
        assert updated_transaction["comments"] == "Pago de servicios actualizado"

    def test_update_balance_of_account_income_to_expense(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": 1,  # Asegúrate de que esta categoría existe
            "account_id": 1,  # Asegúrate de que esta cuenta existe
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client.put(f"/transactions/{create_transactions[1]}", headers=token_user, json=updated_data)
        response = client.get(f"/accounts/{1}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 4550

    def test_update_balance_of_account_income_to_expense_without_amount(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": 1,  # Asegúrate de que esta categoría existe
            "account_id": 1,  # Asegúrate de que esta cuenta existe
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client.put(f"/transactions/{create_transactions[1]}", headers=token_user, json=updated_data)
        response = client.get(f"/accounts/{1}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 4600

    def test_update_balance_of_account_income_to_income(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": 2,  # Asegúrate de que esta categoría existe
            "account_id": 1,  # Asegúrate de que esta cuenta existe
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client.put(f"/transactions/{create_transactions[1]}", headers=token_user, json=updated_data)
        response = client.get(f"/accounts/{1}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 5050

    def test_update_balance_of_account_expense_to_expense(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):
        # Eliminar una transacción
        delete_response = client.delete(
            f"/transactions/{create_transactions[1]}",
            headers=token_user,
        )
        assert delete_response.status_code == 204

        # Datos de la transacción actualizada
        updated_data = {
            "category_id": 1,  # Asegúrate de que esta categoría existe
            "account_id": 1,  # Asegúrate de que esta cuenta existe
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client.put(f"/transactions/{create_transactions[0]}", headers=token_user, json=updated_data)
        response = client.get(f"/accounts/{1}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 4750

    def test_update_balance_of_account_expense_to_income(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": 2,  # Asegúrate de que esta categoría existe
            "account_id": 1,  # Asegúrate de que esta cuenta existe
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Eliminar una transacción
        delete_response = client.delete(
            f"/transactions/{create_transactions[1]}",
            headers=token_user,
        )
        assert delete_response.status_code == 204

        # Actualizar la última transacción
        response = client.put(f"/transactions/{create_transactions[0]}", headers=token_user, json=updated_data)
        response = client.get(f"/accounts/{1}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 5250

    def test_update_balance_of_account_expense_to_income_without_amount(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": 2,  # Asegúrate de que esta categoría existe
            "account_id": 1,  # Asegúrate de que esta cuenta existe
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Eliminar una transacción
        delete_response = client.delete(
            f"/transactions/{create_transactions[1]}",
            headers=token_user,
        )
        assert delete_response.status_code == 204

        # Actualizar la última transacción
        response = client.put(f"/transactions/{create_transactions[0]}", headers=token_user, json=updated_data)
        response = client.get(f"/accounts/{1}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 5200

    def test_update_transaction_not_found(
        self,
        client: TestClient,
        token_user: dict,
    ):
        # Intentar actualizar una transacción con un ID inexistente
        transaction_id = 999  # ID de transacción inexistente
        updated_data = {
            "category_id": 1,
            "account_id": 1,
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }
        response = client.put(f"/transactions/{transaction_id}", headers=token_user, json=updated_data)
        assert response.status_code == 404
        assert response.json()["detail"] == "Transaction not found"

    def test_update_transaction_not_last(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):
        # Intentar actualizar una transacción que no es la última
        previous_transaction_id = create_transactions[0]  # ID de la transacción anterior
        updated_data = {
            "category_id": 1,
            "account_id": 1,
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }
        response = client.put(f"/transactions/{previous_transaction_id}", headers=token_user, json=updated_data)
        assert response.status_code == 400
        assert response.json()["detail"] == "Only the last transaction can be updated"

    def test_update_transaction_account_not_found(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):
        # Datos de la transacción actualizada con un ID de cuenta que no existe
        updated_data = {
            "category_id": 1,  # Asegúrate de que esta categoría existe
            "account_id": 999,  # ID de cuenta inexistente
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Intentar actualizar la última transacción
        response = client.put(f"/transactions/{create_transactions[1]}", headers=token_user, json=updated_data)
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"

    def test_update_transaction_category_not_found(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):
        # Datos de la transacción actualizada con un ID de cuenta que no existe
        updated_data = {
            "category_id": 999,  # Esta categoria no existe
            "account_id": 1,  # ID de cuenta inexistente
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Intentar actualizar la última transacción
        response = client.put(f"/transactions/{create_transactions[1]}", headers=token_user, json=updated_data)
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"


@pytest.mark.transaction
@pytest.mark.delete_transaction
class TestDeleteTransactions:

    def test_delete_transaction_income(
        self,
        client: TestClient,
        token_user: dict,
        create_account: int,
        create_transactions: tuple[int],
    ):

        # Eliminar una transacción income
        delete_response = client.delete(
            f"/transactions/{create_transactions[1]}",
            headers=token_user,
        )
        assert delete_response.status_code == 204

        # Verificar que la transacción ya no exista
        get_response = client.get(
            f"/transactions/{create_transactions[1]}",
            headers=token_user,
        )
        assert get_response.status_code == 404
        assert get_response.json()["detail"] == "Transaction not found"

        # Verifica que el saldo de la cuenta se haya restaurado
        response = client.get(f"/accounts/{create_account}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 4800

        # Eliminar una transacción expense
        delete_response = client.delete(
            f"/transactions/{create_transactions[0]}",
            headers=token_user,
        )
        assert delete_response.status_code == 204

        # Verificar que la transacción ya no exista
        get_response = client.get(
            f"/transactions/{create_transactions[0]}",
            headers=token_user,
        )
        assert get_response.status_code == 404
        assert get_response.json()["detail"] == "Transaction not found"

        # Verifica que el saldo de la cuenta se haya restaurado
        response = client.get(f"/accounts/{create_account}", headers=token_user)
        assert response.status_code == 200
        assert response.json()["balance"] == 5000

    def test_delete_transaction_not_found(
        self,
        client: TestClient,
        token_user: dict,
    ):
        # Intentamos eliminar una transacción con un ID inexistente
        transaction_id = 999  # ID de transacción inexistente
        response = client.delete(
            f"/transactions/{transaction_id}",
            headers=token_user,
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Transaction not found"

    def test_delete_transaction_not_last(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions: tuple[int],
    ):

        # Intentamos eliminar la primera transacción, que no es la última
        response = client.delete(
            f"/transactions/{create_transactions[0]}",
            headers=token_user,
        )

        assert response.status_code == 400
        assert response.json()["detail"] == "Only the last transaction can be deleted"

        # Verificamos que la última transacción aún existe
        last_transaction_response = client.get(f"/transactions/{create_transactions[1]}", headers=token_user)
        assert last_transaction_response.status_code == 200

    def test_delete_transaction_of_other_user_account(
        self,
        client: TestClient,
        token_user: dict,
        create_transactions_other_user: int,
    ):

        # Intentamos eliminar la primera transacción, que no es la última
        response = client.delete(
            f"/transactions/{create_transactions_other_user}",
            headers=token_user,
        )

        assert response.status_code == 404
        assert response.json()["detail"] == "Transaction not found"
