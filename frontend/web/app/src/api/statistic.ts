import { axi } from "./axiosConfig";
import { ErrorResponse  } from "@/schemas/error";
import { AxiosError } from 'axios';
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


export const getMonthlySumary = (token: string, date: DateIn): Promise<MonthlySumary | ErrorResponse> => {
    return axi.get('/statistics/monthly-summary', {
        params: {
            year: date.year,
            month: date.month
        },
        headers: { 'Authorization': `Bearer ${token}` }
    })
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

export const getMonthlyExpenses = (token: string, date: DateIn): Promise<MonthlyExpenses[] | ErrorResponse> => {
    return axi.get('/statistics/monthly-expenses', {
        params: {
            year: date.year,
            month: date.month
        },
        headers: { 'Authorization': `Bearer ${token}` }
    })
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

export const getMonthlyIncomes = (token: string, date: DateIn): Promise<MonthlyIncomes[] | ErrorResponse> => {
    return axi.get('/statistics/monthly-incomes', {
        params: {
            year: date.year,
            month: date.month
        },
        headers: { 'Authorization': `Bearer ${token}` }
    })
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