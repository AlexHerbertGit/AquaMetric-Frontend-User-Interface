import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5017",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("am_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// NEW: handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("am_token");
      // hard redirect so state resets cleanly
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;