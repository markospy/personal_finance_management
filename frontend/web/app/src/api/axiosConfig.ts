import axios from "axios";

const url = import.meta.env.VITE_BASE_URL

if (!url) {
    throw new Error("La variable de entorno VITE_BASE_URL no está definida");
}

export const axi = axios.create({
	baseURL: url,
	timeout: 1000,
	headers: {'Accept': 'application/json'},
});