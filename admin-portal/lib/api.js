import axios from "axios";
import { clearToken, getToken, setToken } from "./auth";
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1", withCredentials: true });
api.interceptors.request.use((config) => { const token = getToken(); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use((res) => res, async (error) => {
  const original = error.config;
  if (error.response?.status === 401 && error.response?.data?.error?.code === "TOKEN_EXPIRED" && !original._retry) {
    original._retry = true;
    try { const res = await api.post("/auth/refresh"); setToken(res.data.data.accessToken); original.headers.Authorization = `Bearer ${res.data.data.accessToken}`; return api(original); }
    catch (_) { clearToken(); if (typeof window !== "undefined") window.location.href = "/login"; }
  }
  return Promise.reject(error);
});
export default api;
