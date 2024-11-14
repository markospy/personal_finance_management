import { UserIn, UserOut } from "../schemas/user";
import { axi } from "./config";

export const createUser = (user: UserIn): Promise<UserOut | Error> => {
    return axi.post('/user', user)
        .then(response => response.data)
        .catch(error => {
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
};


export const getUser = (token: string): Promise<UserOut> => {

    return axi.get('/user/me', {headers: {'Authorization': `Bearer ${token}`}})
        .then(response => {
            console.log(response.status)
            return response.data; // Devuelve los datos de la respuesta
        })
        .catch(error => {
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
};