import axios from "axios";


export const axi = axios.create({
	baseURL: process.env.API_URL,
	timeout: 1000,
	headers: {'Accept': 'application/json'},
});