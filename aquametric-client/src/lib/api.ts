import axios from "axios";
import { getToken } from "./auth";

const baseURL = import.meta.env.VITE_API_URL as string | undefined;
if (!baseURL) throw new Error("VITE_API_URL is not set");

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;