import { axi } from "./config";

export type TokenOut = {
    access_token: string;
    token_type: string
}

axi.defaults.timeout = 5000

export const getToken = (username: string, password: string): Promise<TokenOut> => {
    return axi.post(
        '/token',
        `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&scope=user`,
        {headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        }},

    ).then(response => {
            console.log(response.data.access_token)
            return response.data
        }
    ).catch(() => {
        throw new Error('Error al obtener el token')
    });
};
