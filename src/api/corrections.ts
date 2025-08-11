import axios from "axios";
const API = axios.create({ baseURL: "http://localhost:5000" });

const withAuth = (token?: string) => ({ headers: { Authorization: token ? `Bearer ${token}` : "" } });

// create correction
export const createCorrection = (postId: string, content: string, explanation: string, token?: string) =>
  API.post("/api/corrections", { postId, content, explanation }, withAuth(token));

// vote (toggle)
export const voteCorrection = (postId: string, correctionId: string, token?: string) =>
  API.post("/api/corrections/vote", { postId, correctionId }, withAuth(token));

// choose best
export const chooseBest = (postId: string, correctionId: string, token?: string) =>
  API.patch(`/api/corrections/${postId}/best/${correctionId}`, {}, withAuth(token));

// fetch corrections by post (we already get them via GET /comments or GET /posts/:id, but helper)
export const fetchCorrectionsByPost = (postId: string) =>
  API.get(`/api/posts/${postId}`); // returns full post including corrections
