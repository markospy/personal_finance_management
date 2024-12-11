export function getToken() {
    // Obtiene el token del localStorage
    return window.localStorage.getItem('token') as string;
}