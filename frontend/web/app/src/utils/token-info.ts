export function isTokenExpired(token: string) {
    if (!token) {
        return true; // Si no hay token, consideramos que está expirado
    }

    // Dividir el token en sus partes
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Token no válido');
    }

    // Decodificar el payload (la segunda parte del token)
    const payload = JSON.parse(atob(parts[1]));

    // Obtener la fecha de expiración
    const exp = payload.exp;
    if (!exp) {
        throw new Error('El token no tiene campo de expiración');
    }

    // Comparar la fecha de expiración con la fecha actual
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    return exp < currentTime; // Retorna true si el token ha expirado
}