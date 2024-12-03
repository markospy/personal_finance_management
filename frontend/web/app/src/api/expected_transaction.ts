import { ExpTransactionIn, ExpTransactionOut, ExpTransactionUpdate } from "../schemas/expected_transaction";
import { ErrorResponse  } from "@/schemas/error";
import { AxiosError } from 'axios';
import { axi } from "./axiosConfig";


export const createExpTransaction = (token: string, transaction: ExpTransactionIn): Promise<ExpTransactionOut | ErrorResponse> => {
	return axi.post('/expected_transactions', {
			"category_id": transaction.category_id,
			"amount": transaction.amount,
			"date": transaction.date,
			"frequency": transaction.frequency,
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

export const getExpTransaction = (token: string, id: number): Promise<ExpTransactionOut | ErrorResponse> => {
	return axi.get('/expected_transactions/' + id, { headers: { 'Authorization': `Bearer ${token}` } })
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

export const getExpTransactions = (token: string): Promise<ExpTransactionOut[] | ErrorResponse> => {
	return axi.get('/expected_transactions/', { headers: { 'Authorization': `Bearer ${token}` } })
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

export const updateExpTransaction = (token: string, id: number, transaction: ExpTransactionUpdate): Promise<ExpTransactionOut | ErrorResponse> => {
	return axi.put('/expected_transactions/' + id, {
			"category_id": transaction.category_id,
			"amount": transaction.amount,
			"date": transaction.date,
			"frequency": transaction.frequency,
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