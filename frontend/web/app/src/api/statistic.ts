import { axi } from "./config";
import { DateIn } from "@/schemas/date";

export type MonthlySumary = {
    totalExpenses: number,
    totalIncomes: number
}

export type MonthlyExpenses = {
	categoryId: number,
	categoryName: string,
	totalAmount: number
}

export type MonthlyIncomes = MonthlyExpenses;

export const getMonthlySumary = (token: string, date:  DateIn): Promise<MonthlySumary> => {
    return axi.get('/statistics/monthly-summary',
        {
            params: {
                year: date.year,
                month: date.month
            },
            headers: {'Authorization': `Bearer ${token}`}
        }
    ).then(
		response => {
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

export const getMonthlyExpenses = (token: string, date: DateIn): Promise<MonthlyExpenses[]> => {
    return axi.get('/statistics/monthly-expenses',
        {
            params: {
                year: date.year,
                month: date.month
            },
            headers: {'Authorization': `Bearer ${token}`}
        }
    ).then(
		response => {
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

export const getMonthlyIncomes = (token: string, date: DateIn): Promise<MonthlyIncomes[]> => {
    return axi.get('/statistics/monthly-incomes',
        {
            params: {
                year: date.year,
                month: date.month
            },
            headers: {'Authorization': `Bearer ${token}`}
        }
    ).then(
		response => {
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