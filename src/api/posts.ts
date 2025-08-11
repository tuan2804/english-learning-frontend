import axios from "axios";
const API = axios.create({ baseURL: "http://localhost:5000" });

const withAuth = (token?: string) => ({ headers: { Authorization: token ? `Bearer ${token}` : "" } });

export const fetchPosts = () => API.get("/api/posts");
export const createPost = (payload: any, token?: string) => API.post("/api/posts", payload, withAuth(token));
export const getPostById = (id: string) => API.get(`/api/posts/${id}`);
export const deletePost = (id: string, token?: string) => API.delete(`/api/posts/${id}`, withAuth(token));
