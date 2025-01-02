import { AccountIn, AccountOut } from "../schemas/account";
import { ErrorResponse  } from "@/schemas/error";
import { AxiosError } from 'axios';
import { axi } from "./axiosConfig";

// Get all accounts.
export const getAccounts = (token: string): Promise<AccountOut[] | ErrorResponse> => {
    return axi.get("/accounts", { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.data;
    })
    .catch((error: AxiosError) => {
        const status = error.response?.status || 500;
        const msg = error.message;

        return {
            status,
            msg
        };
    });
};

// Get a account
export const getAccount = (token: string, id: number): Promise<AccountOut | ErrorResponse> => {
    return axi.get(`/accounts/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.data;
    })
    .catch((error: AxiosError) => {
        const status = error.response?.status || 500;
        const msg = error.message;

        return {
            status,
            msg
        };
    });
};

// Create an account
export const createAccount = (token: string, account: AccountIn): Promise<AccountOut> => {
    return axi.post('/accounts', {
        "name": account.name,
        "currency": account.currency,
        "balance": account.balance,
    }, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.data;
    })
    .catch((error: AxiosError) => {
        const detail: {detail: string} = error.response?.data as {detail: string};
        throw new Error(`${detail.detail}`)
    });
};

// Update an account
export const updateAccount = (token: string, id: number, account: AccountIn): Promise<AccountOut> => {
    console.log(id)
    return axi.put(`/accounts/${id}`, {
        "name": account?.name,
        "currency": account?.currency,
        "balance": account?.balance,
    }, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.data;
    })
    .catch((error: AxiosError) => {
        const detail: {detail: string} = error.response?.data as {detail: string};
        throw new Error(`${detail.detail}`)
    });
};

// Eliminate an account
export const deleteAccount = (token: string, id?: number): Promise<string> => {
    return axi.delete(`/accounts/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
        console.log(response.status);
        return response.statusText;
    })
    .catch((error: AxiosError) => {
        const detail: {detail: string} = error.response?.data as {detail: string};
        throw new Error(`${detail.detail}`)
    });
};