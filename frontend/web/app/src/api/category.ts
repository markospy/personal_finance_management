import { CategoryIn, CategoryOut } from "../schemas/category";
import { axi } from "./axiosConfig";

type CategoryType =  'global' | 'user';

export const createCategory = (token: string, type: CategoryType, category: CategoryIn): Promise<CategoryOut> => {
    const is_global = type == 'global';

	return axi.post('/categories/' + type,
		{
			"name": category.name,
			"type": category.type,
			"is_global": is_global,
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

export const getCategories = (token: string): Promise<CategoryOut[]> => {

	return axi.get('/categories/', {headers: {'Authorization': `Bearer ${token}`}})
	.then( response =>
		{
			console.log(response.status)
			return response.data;
		}
	).catch(error => {
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

export const getCategory = (token: string, id: number): Promise<CategoryOut> => {

	return axi.get('/categories/' + id, {headers: {'Authorization': `Bearer ${token}`}})
	.then( response =>
		{
			console.log(response.status)
			return response.data;
		}
	).catch(error => {
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


export const deleteCategory = (token: string, id: number, type: CategoryType): Promise<string> => {

	return axi.delete(`/categories/${id}/${type}`, {headers: {'Authorization': `Bearer ${token}`}})
	.then( response =>
		{
			console.log(response.status)
			return response.statusText;
		}
	).catch(error => {
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