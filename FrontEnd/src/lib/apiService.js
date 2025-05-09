import axios from "axios";
import { getToken } from "../services/localStorageService";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Sử dụng tên biến mới
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
