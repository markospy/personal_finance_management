import { UserIn, UserOut } from "../schemas/user";
import { ErrorResponse  } from "@/schemas/error";
import { AxiosError } from 'axios';
import { axi } from "./axiosConfig";


export const createUser = (user: UserIn): Promise<UserOut | ErrorResponse > => {
  return axi.post('/user', user)
    .then(response => response.data) // Devuelve los datos de la respuesta
    .catch((error: AxiosError) => {
      // Asegúrate de que error.response esté definido
      const status = error.response?.status || 500; // Valor por defecto
      const msg = error.message;

      return {
        status,
        msg
      };
    });
};


export const getUser  = (token: string): Promise<UserOut | ErrorResponse> => {
  return axi.get('/user/me', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => response.data) // Devuelve los datos de la respuesta
    .catch((error: AxiosError) => {
      // Manejo de errores
      const status = error.response?.status || 500; // Valor por defecto
      const msg = error.message;

      // Retornar un objeto de error
      return {
        status,
        msg
      };
    });
};

export const deleteUser  = (token: string): Promise<string | ErrorResponse> => {
  return axi.delete('/user/me', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
      console.log(response.status);
      return response.statusText; // Devuelve el texto del estado de la respuesta
    })
    .catch((error: AxiosError) => {
      // Manejo de errores
      const status = error.response?.status || 500; // Valor por defecto
      const msg = error.message;

      // Retornar un objeto de error
      return {
        status,
        msg
      };
    });
};