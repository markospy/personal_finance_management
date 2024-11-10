import { ExpTransactionIn, ExpTransactionOut, ExpTransactionUpdate } from "../schemas/expected_transactions";
import { axi } from "./api_url";


export const createExpTransaction: (toke: string, transaction: ExpTransactionIn) => Promise<ExpTransactionOut> = (token, transaction) => {
	return axi.post('/expected_transactions',
	{
		"category_id": transaction.category_id,
		"amount": transaction.amount,
		"date": transaction.date,
        "frequency": transaction.frequency,
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

export const getExpTransaction: (toke: string, id: number) => Promise<ExpTransactionOut> = (token, id) => {
	return axi.get('/expected_transactions/' + id, {headers: {'Authorization': `Bearer ${token}`}})
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

export const getExpTransactions: (toke: string) => Promise<ExpTransactionOut[]> = (token) => {
	return axi.get('/expected_transactions/', {headers: {'Authorization': `Bearer ${token}`}})
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


export const updateExpTransaction: (toke: string, id: number, transaction: ExpTransactionUpdate) => Promise<ExpTransactionOut> = (token, id, transaction) => {
	return axi.put('/expected_transactions/' + id,
		{
			"category_id": transaction.category_id,
			"amount": transaction.amount,
			"date": transaction.date,
            "frequency": transaction.frequency,
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