import { axi } from "./config";

type TokenOut = {
    acces_token: string;
    token_type: string
}

export const getToken = (username: string, password: string): Promise<TokenOut | Error> => {
    return axi.post(
        '/token',
        `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&scope=user`,
        {headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        }}
    ).then(response => {
            console.log(response.data.access_token)
            window.localStorage.setItem('jwt', response.data.access_token)
            return response.data
        }
    ).catch(error => Promise.reject(error));
};
