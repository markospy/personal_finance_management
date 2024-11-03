import axios from "axios";
import { CategoryIn, CategoryOut } from "../schemas/category";
import { API_URL } from "./api_url";

type CategoryType =  'global' | 'user';


const axi = axios.create({
	baseURL: API_URL,
	timeout: 1000,
	headers: {'Accept': 'application/json'},
});


export const createCategory: (token: string, type: CategoryType, category: CategoryIn) => Promise<CategoryOut> = (token, type, category) => {
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