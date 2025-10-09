import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // If you later secure the API with cookies or tokens, add headers here
});

export default api;