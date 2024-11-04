import axios from "axios";

const API_URL = 'http://localhost:8000';

export const axi = axios.create({
	baseURL: API_URL,
	timeout: 1000,
	headers: {'Accept': 'application/json'},
});