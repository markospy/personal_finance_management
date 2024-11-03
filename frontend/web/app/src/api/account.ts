import axios from "axios";
import { AccountIn, AccountOut } from "../schemas/account";
import { API_URL } from "./api_url";

const axi = axios.create({
	baseURL: API_URL,
	timeout: 1000,
	headers: {'Accept': 'application/json'},
});


export const getAccounts: (token: string) => Promise<AccountOut[]> = (token) => {
	return axi.get("/accounts", {headers: {'Authorization': `Bearer ${token}`}}).then(
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

export const getAccount: (token: string, id: number) => Promise<AccountOut> = (token, id) => {
	return axi.get('/accounts/' + id, {headers: {'Authorization': `Bearer ${token}`}}).then(
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


export const createAccount: (token: string, account: AccountIn) => Promise<AccountOut> = (token, account) => {
	return axi.post('/accounts',
		{
			"name": account.name,
			"currency": account.currency,
			"balance": account.balance,
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

export const deleteAccount: (token:string, id: number) => Promise<string> = (token, id) => {
	return axi.delete(`/accounts/${id}`, {headers: {'Authorization': `Bearer ${token}`}})
	.then( response => {
		console.log(response.status)
		return response.statusText
	})
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