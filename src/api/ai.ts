import axios from "axios";
const API = axios.create({ baseURL: "http://localhost:5000" });
const withAuth = (token?: string) => ({ headers: { Authorization: token ? `Bearer ${token}` : "" } });

export const aiSuggest = (content: string, token?: string) => API.post("/api/ai/suggest", { content }, withAuth(token));
