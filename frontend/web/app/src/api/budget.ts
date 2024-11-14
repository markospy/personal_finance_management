import { axi } from "./config";
import { BudgetIn, BudgetOut, BudgetStatus, BudgetUpdate } from "../schemas/budget";


export const createBudget: (token: string, budget: BudgetIn) => Promise<BudgetOut> = (token, budget) => {
    return axi.post('/budgets/',
        {
            "category_id": budget.category_id,
            "amount": budget.amount,
            "period": {
              "start_date": budget.period.start_date,
              "end_date": budget.period.end_date
            }
        },
        {headers: {'Authorization': `Bearer ${token}`}}
    ).then(response => {
        console.log(response.status)
        return response.data;
    }).catch(error => {
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

export const getBudgets: (token: string) => Promise<BudgetOut[]> = (token) => {
    return axi.get('/budgets/', {headers: {'Authorization': `Bearer ${token}`}}
    ).then(response => {
        console.log(response.status)
        return response.data;
    }).catch(error => {
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

export const getBudget: (token: string, id: number) => Promise<BudgetOut> = (token, id) => {
    return axi.get(`/budgets/${id}`, {headers: {'Authorization': `Bearer ${token}`}}
    ).then(response => {
        console.log(response.status)
        return response.data;
    }).catch(error => {
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

export const updateBudget: (token: string, id: number, budget: BudgetUpdate) => Promise<BudgetOut> = (token, id, budget) => {
    const data = () => {
        if(budget.period) {
            return {
                "category_id": budget.category_id,
                "amount": budget.amount,
                "period": {
                    "start_date": budget.period?.start_date,
                    "end_date": budget.period?.end_date
                }}
            } else {
                return {
                    "category_id": budget.category_id,
                    "amount": budget.amount,
                }
            }
        }

    return axi.put(`/budgets/${id}`, data, {headers: {'Authorization': `Bearer ${token}`}})
    .then(response => {
        console.log(response.status)
        return response.data;
    }).catch(error => {
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

export const getBudgetStatus: (token: string, id: number) => Promise<BudgetStatus> = (token, id) => {
    return axi.get(`/budgets/${id}/status`, {headers: {'Authorization': `Bearer ${token}`}}
    ).then(response => {
        console.log(response.status)
        return response.data;
    }).catch(error => {
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

export const deleteBudget: (token: string, id: number) => Promise<string> = (token, id) => {
    return axi.delete(`/budgets/${id}`, {headers: {'Authorization': `Bearer ${token}`}}
    ).then(response => {
        console.log(response.status)
        return response.statusText;
    }).catch(error => {
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