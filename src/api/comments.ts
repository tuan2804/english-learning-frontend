import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchComments = (postId: string) =>
  axios.get(`${API_URL}/comments/${postId}`);

export const createComment = (postId: string, content: string, token?: string) =>
  axios.post(
    `${API_URL}/comments`,
    { postId, content },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const toggleVote = (commentId: string, type: 'up' | 'down', token?: string) =>
  axios.post(
    `${API_URL}/votes`,
    { commentId, type },
    { headers: { Authorization: `Bearer ${token}` } }
  );


// Lấy vote của 1 comment
export const fetchVotesByComment = (commentId: string) => {
  return axios.get(`${API_URL}/votes/${commentId}`)
}
