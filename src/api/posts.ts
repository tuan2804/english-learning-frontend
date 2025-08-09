import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000" });

const withAuth = (token?: string) => ({
  headers: { Authorization: token ? `Bearer ${token}` : "" }
});

export const fetchPosts = () => API.get("/api/posts");
export const createPost = (payload: any, token?: string) => API.post("/api/posts", payload, withAuth(token));