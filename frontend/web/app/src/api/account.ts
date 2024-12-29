import { AccountIn, AccountOut } from "../schemas/account";
import { ErrorResponse  } from "@/schemas/error";
import { AxiosError } from 'axios';
import { axi } from "./axiosConfig";


export const getAccounts = (token: string): Promise<AccountOut[] | ErrorResponse> => {
    return axi.get("/accounts", { headers: { 'Authorization': `Bearer ${token}` } })
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

export const getAccount = (token: string, id: number): Promise<AccountOut | ErrorResponse> => {
    return axi.get('/accounts/' + id, { headers: { 'Authorization': `Bearer ${token}` } })
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

export const createAccount = (token: string, account: AccountIn): Promise<AccountOut> => {
    return axi.post('/accounts', {
        "name": account.name,
        "currency": account.currency,
        "balance": account.balance,
    }, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.data; // Devuelve los datos de la respuesta
    })
    .catch((error: AxiosError) => {
        throw new Error(`${error.response?.status}`)
    });
};

export const updateAccount = (token: string, id?: number, account?: AccountIn): Promise<AccountOut> => {
    return axi.put(`/accounts/${id}`, {
        "name": account?.name,
        "currency": account?.currency,
        "balance": account?.balance,
    }, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.data; // Devuelve los datos de la respuesta
    })
    .catch((error: AxiosError) => {
        throw new Error(`${error.response?.status}`)
    });
};

export const deleteAccount = (token: string, id?: number): Promise<string> => {
    return axi.delete(`/accounts/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.statusText; // Devuelve el texto del estado de la respuesta
    })
    .catch((error: AxiosError) => {
        throw new Error(`${error.response?.status}`)
    });
};