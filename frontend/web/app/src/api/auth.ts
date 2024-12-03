import { axi } from "./axiosConfig";
import { ErrorResponse  } from "@/schemas/error";
import { AxiosError } from 'axios';

export type TokenOut = {
    access_token: string;
    token_type: string
}

axi.defaults.timeout = 5000

export const getToken = (username: string, password: string): Promise<TokenOut | ErrorResponse> => {
    return axi.post(
        '/token',
        `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&scope=user`,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    ).then(response => {
        return response.data; // Devuelve los datos de la respuesta
    }).catch((error: AxiosError) => {
        const status = error.response?.status || 500; // Valor por defecto
        const msg = error.message;

        // Retornar un objeto de error
        return {
            status,
            msg
        };
    });
};
