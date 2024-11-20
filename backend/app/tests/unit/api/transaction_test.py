from datetime import datetime

import pytest
from fastapi.testclient import TestClient


@pytest.mark.transaction
@pytest.mark.create_transaction
class TestCreateTransactions:

    def test_create_expense_transaction(
        self,
        client_John: TestClient,
        John_token: dict,
        account_John: dict,
        global_expense_category: dict,
    ):
        date = str(datetime.now())
        date_isoformat = datetime.strptime(date, "%Y-%m-%d %H:%M:%S.%f").isoformat()
        response = client_John.post(
            "/transactions",
            headers=John_token,
            json={
                "category_id": global_expense_category["id"],
                "account_id": account_John["id"],
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 201
        transaction = response.json()
        assert transaction["categoryId"] == global_expense_category["id"]
        assert transaction["accountId"] == account_John["id"]
        assert transaction["amount"] == 200.0
        assert transaction["date"] == date_isoformat
        assert transaction["comments"] == "Pago de servicios"

        # Comprobar que se hizo el descuento de la cuenta
        response = client_John.get(f"/accounts/{account_John["id"]}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["balance"] == 4800

    def test_create_income_transaction(
        self,
        client_John: TestClient,
        John_token: dict,
        account_John: dict,
        John_income_category: dict,
    ):
        date = str(datetime.now())
        date_isoformat = datetime.strptime(date, "%Y-%m-%d %H:%M:%S.%f").isoformat()
        response = client_John.post(
            "/transactions",
            headers=John_token,
            json={
                "category_id": John_income_category["id"],
                "account_id": account_John["id"],
                "amount": 200.0,
                "date": date,
                "comments": "Cobro de servicios",
            },
        )
        assert response.status_code == 201
        transaction = response.json()
        assert transaction["categoryId"] == John_income_category["id"]
        assert transaction["accountId"] == account_John["id"]
        assert transaction["amount"] == 200.0
        assert transaction["date"] == date_isoformat
        assert transaction["comments"] == "Cobro de servicios"

        response = client_John.get(f"/accounts/{account_John['id']}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["balance"] == 5200

    def test_create_transaction_invalid_category(
        self,
        client_John: TestClient,
        John_token: dict,
        account_John: dict,
    ):
        date = str(datetime.now())
        response = client_John.post(
            "/transactions",
            headers=John_token,
            json={
                "category_id": 999,  # Non-existent category ID
                "account_id": account_John["id"],
                "amount": 200.0,
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"

    def test_create_transaction_invalid_account(
        self,
        client_John: TestClient,
        John_token: dict,
        John_income_category: dict,
    ):
        date = str(datetime.now())
        response = client_John.post(
            "/transactions",
            headers=John_token,
            json={
                "category_id": John_income_category["id"],
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
        client_John: TestClient,
        John_token: dict,
        account_John: dict,
        global_expense_category: dict,
    ):
        date = str(datetime.now())
        response = client_John.post(
            "/transactions",
            headers=John_token,
            json={
                "category_id": global_expense_category["id"],
                "account_id": account_John["id"],
                "amount": 6000.0,  # Monto que excede el balance
                "date": date,
                "comments": "Pago de servicios",
            },
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Insufficient funds"

    def test_create_transaction_exceeding_budget(
        self,
        client_John: TestClient,
        John_token: dict,
        account_John: dict,
        global_expense_category: dict,
        budget_John: dict,
    ):

        date = str(datetime.now())
        # Crear una transacción que excede el presupuesto
        response = client_John.post(
            "/transactions/",
            json={
                "category_id": global_expense_category["id"],
                "account_id": account_John["id"],
                "amount": 1600.0,
                "date": date,
                "comments": "Compra grande",
                "type": "Expense",
            },
            headers=John_token,
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
        client_John: TestClient,
        John_token: dict,
        income_transaction_John: dict,
        expense_transaction_John: dict,
    ):

        # Obtener todas las transacciones del usuario
        response = client_John.get("/transactions/", headers=John_token)
        assert response.status_code == 200
        transactions = response.json()
        assert isinstance(transactions, list)
        assert any(
            [
                transaction["accountId"] == 1
                and transaction["amount"] == income_transaction_John["amount"]
                and transaction["date"] == income_transaction_John["date"]
                and transaction["comments"] == income_transaction_John["comments"]
                for transaction in transactions
            ]
        )

        assert any(
            [
                transaction["accountId"] == 1
                and transaction["amount"] == expense_transaction_John["amount"]
                and transaction["date"] == expense_transaction_John["date"]
                and transaction["comments"] == expense_transaction_John["comments"]
                for transaction in transactions
            ]
        )

    def test_transactions_not_founds(
        self,
        client_John: TestClient,
        John_token: dict,
    ):

        # Obtener todas las transacciones del usuario
        response = client_John.get("/transactions/", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Transactions not found"

    def test_get_transactions_by_account(
        self,
        client_John: TestClient,
        John_token: dict,
        account_John: dict,
        expense_transaction_John: dict,
        income_transaction_John: dict,
    ):

        response = client_John.get(
            f"/transactions/account/{account_John["id"]}",
            headers=John_token,
        )
        assert response.status_code == 200
        transactions = response.json()
        assert isinstance(transactions, list)
        assert any(
            [
                transaction["accountId"] == 1
                and transaction["amount"] == income_transaction_John["amount"]
                and transaction["date"] == income_transaction_John["date"]
                and transaction["comments"] == income_transaction_John["comments"]
                for transaction in transactions
            ]
        )

        assert any(
            [
                transaction["accountId"] == 1
                and transaction["amount"] == expense_transaction_John["amount"]
                and transaction["date"] == expense_transaction_John["date"]
                and transaction["comments"] == expense_transaction_John["comments"]
                for transaction in transactions
            ]
        )

    def test_get_transactions_by_account_not_found(
        self,
        client_John: TestClient,
        John_token: dict,
    ):

        response = client_John.get("/transactions/account/999", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"

    def test_get_transaction_by_id(
        self,
        client_John: TestClient,
        John_token: dict,
        expense_transaction_John: dict,
    ):
        # Obtener una transacción específica por su ID
        response = client_John.get(f"/transactions/{expense_transaction_John["id"]}", headers=John_token)
        assert response.status_code == 200
        transaction = response.json()
        assert transaction["id"] == expense_transaction_John["id"]
        assert transaction["amount"] == 200.0  # Ajusta esto al monto de la transacción creada
        assert transaction["comments"] == "Cobro de servicios"  # Ajusta esto según el comentario de la transacción

    def test_get_transaction_not_found(
        self,
        client_John: TestClient,
        John_token: dict,
    ):
        # Intentar obtener una transacción con un ID inexistente
        response = client_John.get("/transactions/999", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Transaction not found"


@pytest.mark.transaction
@pytest.mark.update_transaction
class TestUpdateTransaction:

    def test_update_last_transaction(
        self,
        client_John: TestClient,
        John_token: dict,
        account_John: dict,
        expense_transaction_John: dict,
        John_income_category: dict,
    ):
        # Datos para actualizar la transacción
        date = str(datetime.now())
        date_isoformat = datetime.strptime(date, "%Y-%m-%d %H:%M:%S.%f").isoformat()
        updated_data = {
            "category_id": John_income_category["id"],
            "account_id": account_John["id"],
            "amount": 250.0,
            "date": date,
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client_John.put(
            f"/transactions/{expense_transaction_John["id"]}", headers=John_token, json=updated_data
        )
        assert response.status_code == 200
        updated_transaction = response.json()
        assert updated_transaction["id"] == expense_transaction_John["id"]
        assert updated_transaction["amount"] == 250.0
        assert updated_transaction["date"] == date_isoformat
        assert updated_transaction["comments"] == "Pago de servicios actualizado"

    def test_update_balance_of_account_income_to_expense(
        self,
        client_John: TestClient,
        John_token: dict,
        income_transaction_John: dict,
        global_expense_category: dict,
        account_John: dict,
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": global_expense_category["id"],
            "account_id": account_John["id"],
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client_John.put(
            f"/transactions/{income_transaction_John["id"]}", headers=John_token, json=updated_data
        )
        response = client_John.get(f"/accounts/{account_John["id"]}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["balance"] == 4750.0

    def test_update_balance_of_account_income_to_expense_without_amount(
        self,
        client_John: TestClient,
        John_token: dict,
        income_transaction_John: dict,
        global_expense_category: dict,
        account_John: dict,
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": global_expense_category["id"],
            "account_id": account_John["id"],
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client_John.put(
            f"/transactions/{income_transaction_John["id"]}", headers=John_token, json=updated_data
        )
        response = client_John.get(f"/accounts/{account_John["id"]}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["balance"] == 4800.0

    def test_update_balance_of_account_income_to_income(
        self,
        client_John: TestClient,
        John_token: dict,
        income_transaction_John: dict,
        John_income_category: dict,
        account_John: dict,
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": John_income_category["id"],
            "account_id": account_John["id"],
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client_John.put(
            f"/transactions/{income_transaction_John["id"]}", headers=John_token, json=updated_data
        )
        response = client_John.get(f"/accounts/{1}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["balance"] == 5250

    def test_update_balance_of_account_expense_to_expense(
        self,
        client_John: TestClient,
        John_token: dict,
        expense_transaction_John: dict,
        global_expense_category: dict,
        account_John: dict,
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": global_expense_category["id"],
            "account_id": account_John["id"],
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client_John.put(
            f"/transactions/{expense_transaction_John["id"]}", headers=John_token, json=updated_data
        )
        response = client_John.get(f"/accounts/{1}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["balance"] == 4750

    def test_update_balance_of_account_expense_to_income(
        self,
        client_John: TestClient,
        John_token: dict,
        expense_transaction_John: dict,
        John_income_category: dict,
        account_John: dict,
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": John_income_category["id"],
            "account_id": account_John["id"],
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client_John.put(
            f"/transactions/{expense_transaction_John['id']}", headers=John_token, json=updated_data
        )
        response = client_John.get(f"/accounts/{account_John['id']}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["balance"] == 5250

    def test_update_balance_of_account_expense_to_income_without_amount(
        self,
        client_John: TestClient,
        John_token: dict,
        expense_transaction_John: dict,
        John_income_category: dict,
        account_John: dict,
    ):
        # Datos de la transacción actualizada
        updated_data = {
            "category_id": John_income_category["id"],
            "account_id": account_John["id"],
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Actualizar la última transacción
        response = client_John.put(
            f"/transactions/{expense_transaction_John['id']}", headers=John_token, json=updated_data
        )
        response = client_John.get(f"/accounts/{account_John['id']}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["balance"] == 5200

    def test_update_transaction_not_found(
        self,
        client_John: TestClient,
        John_token: dict,
    ):
        # Intentar actualizar una transacción con un ID inexistente
        updated_data = {
            "category_id": 1,
            "account_id": 1,
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }
        response = client_John.put("/transactions/999", headers=John_token, json=updated_data)
        assert response.status_code == 404
        assert response.json()["detail"] == "Transaction not found"

    def test_update_transaction_not_last(
        self,
        client_John: TestClient,
        John_token: dict,
        expense_transaction_John: dict,
        income_transaction_John: dict,
    ):
        # Intentar actualizar una transacción que no es la última
        previous_transaction_id = expense_transaction_John["id"]  # ID de la transacción anterior
        updated_data = {
            "category_id": 1,
            "account_id": 1,
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }
        response = client_John.put(f"/transactions/{previous_transaction_id}", headers=John_token, json=updated_data)
        assert response.status_code == 400
        assert response.json()["detail"] == "Only the last transaction can be updated"

    def test_update_transaction_account_not_found(
        self,
        client_John: TestClient,
        John_token: dict,
        income_transaction_John: dict,
    ):
        # Datos de la transacción actualizada con un ID de cuenta que no existe
        updated_data = {
            "category_id": 1,
            "account_id": 999,  # ID de cuenta inexistente
            "amount": 250.0,
            "date": str(datetime.now()),
            "comments": "Pago de servicios actualizado",
        }

        # Intentar actualizar la última transacción
        response = client_John.put(
            f"/transactions/{income_transaction_John["id"]}", headers=John_token, json=updated_data
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"

    def test_update_transaction_category_not_found(
        self,
        client_John: TestClient,
        John_token: dict,
        income_transaction_John: dict,
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
        response = client_John.put(
            f"/transactions/{income_transaction_John['id']}", headers=John_token, json=updated_data
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Category not found"


@pytest.mark.transaction
@pytest.mark.delete_transaction
class TestDeleteTransactions:

    def test_delete_transaction_income(
        self,
        client_John: TestClient,
        John_token: dict,
        account_John: dict,
        expense_transaction_John: dict,
        income_transaction_John: dict,
    ):

        # Eliminar una transacción income
        delete_response = client_John.delete(
            f"/transactions/{income_transaction_John['id']}",
            headers=John_token,
        )
        assert delete_response.status_code == 204

        # Verificar que la transacción ya no exista
        get_response = client_John.get(
            f"/transactions/{income_transaction_John['id']}",
            headers=John_token,
        )
        assert get_response.status_code == 404
        assert get_response.json()["detail"] == "Transaction not found"

        # Verifica que el saldo de la cuenta se haya restaurado
        response = client_John.get(f"/accounts/{account_John['id']}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["balance"] == 4800

        # Eliminar una transacción expense
        delete_response = client_John.delete(
            f"/transactions/{expense_transaction_John['id']}",
            headers=John_token,
        )
        assert delete_response.status_code == 204

        # Verificar que la transacción ya no exista
        get_response = client_John.get(
            f"/transactions/{expense_transaction_John['id']}",
            headers=John_token,
        )
        assert get_response.status_code == 404
        assert get_response.json()["detail"] == "Transaction not found"

        # Verifica que el saldo de la cuenta se haya restaurado
        response = client_John.get(f"/accounts/{account_John['id']}", headers=John_token)
        assert response.status_code == 200
        assert response.json()["balance"] == 5000

    def test_delete_transaction_not_found(
        self,
        client_John: TestClient,
        John_token: dict,
    ):
        # Intentamos eliminar una transacción con un ID inexistente
        response = client_John.delete("/transactions/999", headers=John_token)
        assert response.status_code == 404
        assert response.json()["detail"] == "Transaction not found"

    def test_delete_transaction_not_last(
        self,
        client_John: TestClient,
        John_token: dict,
        income_transaction_John: dict,
        expense_transaction_John: dict,
    ):

        # Intentamos eliminar la primera transacción, que no es la última
        response = client_John.delete(
            f"/transactions/{income_transaction_John['id']}",
            headers=John_token,
        )

        assert response.status_code == 400
        assert response.json()["detail"] == "Only the last transaction can be deleted"

    def test_delete_transaction_of_other_user_account(
        self,
        client_John: TestClient,
        John_token: dict,
        transaction_Jane: dict,
    ):

        # Intentamos eliminar la primera transacción, que no es la última
        response = client_John.delete(
            f"/transactions/{transaction_Jane['id']}",
            headers=John_token,
        )

        assert response.status_code == 404
        assert response.json()["detail"] == "Transaction not found"
