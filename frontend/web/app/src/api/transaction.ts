import { TransactionIn, TransactionOut, TransactionUpdate } from "../schemas/transaction";
import { ErrorResponse  } from "@/schemas/error";
import { AxiosError } from 'axios';
import { axi } from "./axiosConfig";


export const createTransaction = (token: string, transaction: TransactionIn): Promise<TransactionOut | ErrorResponse> => {
    return axi.post('/transactions/', {
        "category_id": transaction.category_id,
        "account_id": transaction.account_id,
        "amount": transaction.amount,
        "date": transaction.date,
        "comments": transaction.comments,
    }, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.data; // Devuelve los datos de la respuesta
    })
    .catch((error: AxiosError) => {
        const status = error.response?.status || 500; // Valor por defecto
        const msg = error.message;

        // Retornar un objeto de error
        return {
            status,
            msg
        };
    });
};

export const getTransaction = (token: string, id: number): Promise<TransactionOut | ErrorResponse> => {
    return axi.get('/transactions/' + id, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.data; // Devuelve los datos de la respuesta
    })
    .catch((error: AxiosError) => {
        const status = error.response?.status || 500; // Valor por defecto
        const msg = error.message;

        // Retornar un objeto de error
        return {
            status,
            msg
        };
    });
};

export const getTransactions = (token: string): Promise<TransactionOut[] | ErrorResponse> => {
    return axi.get('/transactions/', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.data; // Devuelve los datos de la respuesta
    })
    .catch((error: AxiosError) => {
        const status = error.response?.status || 500; // Valor por defecto
        const msg = error.message;

        // Retornar un objeto de error
        return {
            status,
            msg
        };
    });
};

export const getTransactionsByAccount = (token: string, accountId: number): Promise<TransactionOut[] | ErrorResponse> => {
    return axi.get('/transactions/account/' + accountId, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.data; // Devuelve los datos de la respuesta
    })
    .catch((error: AxiosError) => {
        const status = error.response?.status || 500; // Valor por defecto
        const msg = error.message;

        // Retornar un objeto de error
        return {
            status,
            msg
        };
    });
};

export const updateTransaction = (token: string, id: number, transaction: TransactionUpdate): Promise<TransactionOut | ErrorResponse> => {
    return axi.put('/transactions/' + id, {
			"category_id": transaction.category_id,
			"account_id": transaction.account_id,
			"amount": transaction.amount,
			"date": transaction.date,
			"comments": transaction.comments,
		}, { headers: { 'Authorization': `Bearer ${token}` } })
		.then(response => {
			console.log(response.status);
			return response.data; // Devuelve los datos de la respuesta
		})
		.catch((error: AxiosError) => {
			const status = error.response?.status || 500; // Valor por defecto
			const msg = error.message;

			// Retornar un objeto de error
			return {
				status,
				msg
			};
		});
};