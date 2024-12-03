import { CategoryIn, CategoryOut } from "../schemas/category";
import { ErrorResponse  } from "@/schemas/error";
import { AxiosError } from 'axios';
import { axi } from "./axiosConfig";

type CategoryType =  'global' | 'user';

export const createCategory = (token: string, type: CategoryType, category: CategoryIn): Promise<CategoryOut | ErrorResponse> => {
    const is_global = type === 'global';

    return axi.post('/categories/' + type, {
        "name": category.name,
        "type": category.type,
        "is_global": is_global,
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

export const getCategories = (token: string): Promise<CategoryOut[] | ErrorResponse> => {
    return axi.get('/categories/', { headers: { 'Authorization': `Bearer ${token}` } })
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

export const getCategory = (token: string, id: number): Promise<CategoryOut | ErrorResponse> => {
    return axi.get('/categories/' + id, { headers: { 'Authorization': `Bearer ${token}` } })
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

export const deleteCategory = (token: string, id: number, type: CategoryType): Promise<string | ErrorResponse> => {
    return axi.delete(`/categories/${id}/${type}`, { headers: { 'Authorization': `Bearer ${token}` } })
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