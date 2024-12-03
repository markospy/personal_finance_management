import { axi } from "./axiosConfig";
import { ErrorResponse  } from "@/schemas/error";
import { AxiosError } from 'axios';
import { BudgetIn, BudgetOut, BudgetStatus, BudgetUpdate } from "../schemas/budget";


export const createBudget = (token: string, budget: BudgetIn): Promise<BudgetOut | ErrorResponse> => {
	return axi.post('/budgets/', {
			"category_id": budget.category_id,
			"amount": budget.amount,
			"period": {
					"start_date": budget.period.start_date,
					"end_date": budget.period.end_date
			}
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

export const getBudgets = (token: string): Promise<BudgetOut[] | ErrorResponse> => {
	return axi.get('/budgets/', { headers: { 'Authorization': `Bearer ${token}` } })
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

export const getBudget = (token: string, id: number): Promise<BudgetOut | ErrorResponse> => {
	return axi.get(`/budgets/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
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

export const updateBudget = (token: string, id: number, budget: BudgetUpdate): Promise<BudgetOut | ErrorResponse> => {
	const data = () => {
			if (budget.period) {
					return {
							"category_id": budget.category_id,
							"amount": budget.amount,
							"period": {
									"start_date": budget.period.start_date,
									"end_date": budget.period.end_date
							}
					};
			} else {
					return {
							"category_id": budget.category_id,
							"amount": budget.amount,
					};
			}
	};

	return axi.put(`/budgets/${id}`, data(), { headers: { 'Authorization': `Bearer ${token}` } })
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

export const getBudgetStatus = (token: string, id: number): Promise<BudgetStatus | ErrorResponse> => {
	return axi.get(`/budgets/${id}/status`, { headers: { 'Authorization': `Bearer ${token}` } })
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

export const deleteBudget = (token: string, id: number): Promise<string | ErrorResponse> => {
	return axi.delete(`/budgets/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
	.then(response => {
			console.log(response.status);
			return response.statusText; // Devuelve el texto del estado de la respuesta
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