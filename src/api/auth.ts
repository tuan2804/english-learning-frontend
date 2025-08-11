import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

export const login = (payload: { email: string; password: string }) =>
  API.post("/api/auth/login", payload);

export const register = (payload: { username: string; email: string; password: string }) =>
  API.post("/api/auth/register", payload);
