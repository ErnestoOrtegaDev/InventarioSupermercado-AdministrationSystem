/* src/api/axios.ts */

import axios from 'axios';

// Vite expone las variables en import.meta.env
const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Importante para envio/recibir Cookies
    headers: {
        'Content-Type': 'application/json'
    }
});


export default api;