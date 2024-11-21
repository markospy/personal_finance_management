import { TransactionIn, TransactionOut, TransactionUpdate } from "../schemas/transaction";
import { axi } from "./config";


export const createTransaction: (toke: string, transaction: TransactionIn) => Promise<TransactionOut> = (token, transaction) => {
	return axi.post('/transactions/',
	{
		"category_id": transaction.category_id,
		"account_id": transaction.account_id,
		"amount": transaction.amount,
		"date": transaction.date,
		"comments": transaction.comments,
	},
	{headers: {'Authorization': `Bearer ${token}`}}
	).then(
		response => {
			console.log(response.status)
			return response.data;
		}
	)
	.catch(error => {
		// Manejo de errores
		if (error.response) {
			console.log('Error en la respuesta del servidor:', error.response.data);
			console.log('Estado del error:', error.response.status);
			console.log('Encabezados del error:', error.response.headers);
		} else if (error.request) {
			console.log('No se recibió respuesta:', error.request);
		} else {
			console.log('Error al configurar la solicitud:', error.message);
		}
		console.log('Configuración de la solicitud:', error.config);

		// Puedes lanzar el error de nuevo si quieres que la promesa se rechace
		return Promise.reject(error);
	});
}

export const getTransaction: (toke: string, id: number) => Promise<TransactionOut> = (token, id) => {
	return axi.get('/transactions/' + id, {headers: {'Authorization': `Bearer ${token}`}})
	.then(
		response => {
			console.log(response.status)
			return response.data;
		}
	)
	.catch(error => {
		// Manejo de errores
		if (error.response) {
			console.log('Error en la respuesta del servidor:', error.response.data);
			console.log('Estado del error:', error.response.status);
			console.log('Encabezados del error:', error.response.headers);
		} else if (error.request) {
			console.log('No se recibió respuesta:', error.request);
		} else {
			console.log('Error al configurar la solicitud:', error.message);
		}
		console.log('Configuración de la solicitud:', error.config);

		// Puedes lanzar el error de nuevo si quieres que la promesa se rechace
		return Promise.reject(error);
	});
}

export const getTransactions: (toke: string) => Promise<TransactionOut[]> = (token) => {
	return axi.get('/transactions/', {headers: {'Authorization': `Bearer ${token}`}})
	.then(
		response => {
			console.log(response.status)
			return response.data;
		}
	)
	.catch(error => {
		// Manejo de errores
		if (error.response) {
			console.log('Error en la respuesta del servidor:', error.response.data);
			console.log('Estado del error:', error.response.status);
			console.log('Encabezados del error:', error.response.headers);
		} else if (error.request) {
			console.log('No se recibió respuesta:', error.request);
		} else {
			console.log('Error al configurar la solicitud:', error.message);
		}
		console.log('Configuración de la solicitud:', error.config);

		// Puedes lanzar el error de nuevo si quieres que la promesa se rechace
		return Promise.reject(error);
	});
}

export const getTransactionsByAccount: (toke: string, accountId: number) => Promise<TransactionOut[]> = (token, accountId) => {
	return axi.get('/transactions/account/'+ accountId,
		{headers: {'Authorization': `Bearer ${token}`}}
	)
	.then(
		response => {
			console.log(response.status)
			return response.data;
		}
	)
	.catch(error => {
		// Manejo de errores
		if (error.response) {
			console.log('Error en la respuesta del servidor:', error.response.data);
			console.log('Estado del error:', error.response.status);
			console.log('Encabezados del error:', error.response.headers);
		} else if (error.request) {
			console.log('No se recibió respuesta:', error.request);
		} else {
			console.log('Error al configurar la solicitud:', error.message);
		}
		console.log('Configuración de la solicitud:', error.config);

		// Puedes lanzar el error de nuevo si quieres que la promesa se rechace
		return Promise.reject(error);
	});
}

export const updateTransaction: (toke: string, id: number, transaction: TransactionUpdate) => Promise<TransactionOut> = (token, id, transaction) => {
	return axi.put('/transactions/' + id,
		{
			"category_id": transaction.category_id,
			"account_id": transaction.account_id,
			"amount": transaction.amount,
			"date": transaction.date,
			"comments": transaction.comments,
		},
		{headers: {'Authorization': `Bearer ${token}`}})
	.then(
		response => {
			console.log(response.status)
			return response.data;
		}
	)
	.catch(error => {
		console.log(transaction)
		// Manejo de errores
		if (error.response) {
			console.log('Error en la respuesta del servidor:', error.response.data);
			console.log('Estado del error:', error.response.status);
			console.log('Encabezados del error:', error.response.headers);
		} else if (error.request) {
			console.log('No se recibió respuesta:', error.request);
		} else {
			console.log('Error al configurar la solicitud:', error.message);
		}
		console.log('Configuración de la solicitud:', error.config);

		// Puedes lanzar el error de nuevo si quieres que la promesa se rechace
		return Promise.reject(error);
	});
}