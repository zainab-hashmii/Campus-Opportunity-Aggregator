import axios from 'axios';

export const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
    baseURL: API_BASE,
});

export default api;
