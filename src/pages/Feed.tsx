// src/pages/Feed.tsx
import React, { useEffect, useState } from 'react';
import { fetchPosts, createPost } from '../api/posts';
import { fetchComments, createComment } from '../api/comments';
import { createCorrection, voteCorrection, chooseBest } from '../api/corrections';
import { aiSuggest } from '../api/ai';
import { useNavigate } from 'react-router-dom';

type Post = {
  _id: string;
  title: string;
  content: string;
  category: string;
  user?: { username?: string; email?: string };
  createdAt?: string;
  aiSuggestions?: string;
  corrections?: any[];
  bestCorrection?: string;
};

type Comment = {
  _id: string;
  content: string;
  userId?: { username?: string; email?: string };
  votes: number;
  createdAt?: string;
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Writing');
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [correctionInputs, setCorrectionInputs] = useState<Record<string, { content: string; explanation: string }>>({});
  const [showCorrectionInput, setShowCorrectionInput] = useState<Record<string, boolean>>({});
  const token = localStorage.getItem('token') || undefined;
  const navigate = useNavigate();

  const loadPosts = async () => {
    try {
      const res = await fetchPosts();
      setPosts(res.data);
      res.data.forEach((p: Post) => loadComments(p._id));
    } catch (err) {
      console.error(err);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const res = await fetchComments(postId);
      setComments(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPost({ title, content, category }, token);
      await aiSuggest(content, token);
      await loadPosts();
      setTitle('');
      setContent('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Post failed');
    }
  };

  const handleAddCorrection = async (postId: string) => {
    const input = correctionInputs[postId];
    if (!input || !input.content?.trim()) return alert('Nhập nội dung sửa');
    try {
      const res = await createCorrection(postId, input.content, input.explanation || '', token);
      setPosts(prev =>
        prev.map(p => (p._id === postId ? { ...p, corrections: [res.data, ...(p.corrections || [])] } : p))
      );
      setCorrectionInputs(prev => ({ ...prev, [postId]: { content: '', explanation: '' } }));
      setShowCorrectionInput(prev => ({ ...prev, [postId]: false }));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Add correction failed');
    }
  };

  const handleVoteCorrection = async (postId: string, correctionId: string) => {
    try {
      const res = await voteCorrection(postId, correctionId, token);
      const { votes } = res.data;
      setPosts(prev =>
        prev.map(p => {
          if (p._id !== postId) return p;
          return {
            ...p,
            corrections: (p.corrections || []).map((c: any) =>
              c._id === correctionId ? { ...c, votes } : c
            ),
          };
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleChooseBest = async (postId: string, correctionId: string) => {
    try {
      await chooseBest(postId, correctionId, token);
      setPosts(prev => prev.map(p => (p._id === postId ? { ...p, bestCorrection: correctionId } : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string) => {
    try {
      const res = await createComment(postId, newComment[postId], token);
      setComments(prev => ({ ...prev, [postId]: [res.data, ...(prev[postId] || [])] }));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Comment failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Hàm định dạng thời gian kiểu "2 giờ trước"
  const timeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  return (
    <div className="container" style={{ maxWidth: 700, margin: 'auto', padding: 16 }}>
      <div
        className="header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}
      >
        <h2>Bảng Phản Hồi Cộng Đồng</h2>
        <button onClick={handleLogout} className="button">
          Đăng xuất
        </button>
      </div>

      <form className="form" onSubmit={handleSubmitPost} style={{ marginBottom: 30 }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Tiêu đề"
          style={{ width: '100%', padding: 8, marginBottom: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Nội dung"
          style={{ width: '100%', padding: 8, marginBottom: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', minHeight: 80 }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
        >
          <option>Writing</option>
          <option>Grammar</option>
          <option>Vocabulary</option>
        </select>
        <button
          className="button"
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            backgroundColor: '#1877f2',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Đăng bài
        </button>
      </form>

      {posts.map(p => (
        <div
          key={p._id}
          className="post"
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            backgroundColor: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          {/* Header: avatar + username + time */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            {/* Avatar mặc định */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#bbb',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 20,
                userSelect: 'none',
                marginRight: 12,
              }}
            >
              {(p.user?.username || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 16 }}>
                {p.user?.username || p.user?.email || 'Anonymous'}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>{timeAgo(p.createdAt)}</div>
            </div>
          </div>

          {/* Title */}
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>{p.title}</h3>

          {/* Content */}
          <p style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>{p.content}</p>

          {/* AI suggestion */}
          {p.aiSuggestions && (
            <div
              style={{
                marginBottom: 12,
                background: '#f7f7f7',
                padding: 12,
                borderRadius: 6,
                fontStyle: 'italic',
                color: '#555',
              }}
            >
              <strong>AI gợi ý:</strong> {p.aiSuggestions}
            </div>
          )}

          {/* Corrections list */}
          <div style={{ marginBottom: 12 }}>
            <h4>Phiên bản chỉnh sửa</h4>
            {(p.corrections || []).length === 0 && (
              <div style={{ fontStyle: 'italic', color: '#888' }}>Chưa có bản sửa</div>
            )}
            {(p.corrections || []).map((c: any) => (
              <div
                key={c._id}
                style={{
                  borderTop: '1px solid #eee',
                  padding: '8px 0',
                  backgroundColor: p.bestCorrection === c._id ? '#e6f7ff' : 'transparent',
                  borderRadius: 4,
                  display: 'flex',
                  gap: 12,
                }}
              >
                {/* Avatar correction */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: '#bbb',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 18,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    userSelect: 'none',
                    flexShrink: 0,
                  }}
                >
                  {(c.user?.username || c.user?.email || 'A')[0].toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: p.bestCorrection === c._id ? '#1890ff' : undefined, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{c.user?.username || c.user?.email || 'Anonymous'}</span>
                    <span style={{ fontSize: 12, color: '#666', fontWeight: 'normal' }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <div>{c.content}</div>
                  {c.explanation && (
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Giải thích: {c.explanation}</div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => handleVoteCorrection(p._id, c._id)} style={{ cursor: 'pointer' }}>
                      👍 {c.votes}
                    </button>
                    <button
                      style={{ marginLeft: 8, cursor: 'pointer' }}
                      onClick={() => handleChooseBest(p._id, c._id)}
                    >
                      Chọn best
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Button hiện form góp ý sửa */}
          <button
            style={{
              backgroundColor: '#1877f2',
              color: 'white',
              padding: '8px 12px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              marginBottom: 12,
            }}
            onClick={() =>
              setShowCorrectionInput(prev => ({
                ...prev,
                [p._id]: !prev[p._id],
              }))
            }
          >
            {showCorrectionInput[p._id] ? 'Ẩn góp ý sửa' : 'Góp ý sửa'}
          </button>

          {/* Form thêm correction ẩn hiện */}
          {showCorrectionInput[p._id] && (
            <div style={{ marginBottom: 12 }}>
              <input
                value={correctionInputs[p._id]?.content || ''}
                onChange={e =>
                  setCorrectionInputs(prev => ({
                    ...prev,
                    [p._id]: { ...(prev[p._id] || {}), content: e.target.value },
                  }))
                }
                placeholder="Viết bản chỉnh sửa..."
                style={{
                  width: '100%',
                  marginBottom: 6,
                  padding: 8,
                  fontSize: 14,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                }}
              />
              <input
                value={correctionInputs[p._id]?.explanation || ''}
                onChange={e =>
                  setCorrectionInputs(prev => ({
                    ...prev,
                    [p._id]: { ...(prev[p._id] || {}), explanation: e.target.value },
                  }))
                }
                placeholder="Giải thích (tùy chọn)"
                style={{
                  width: '100%',
                  marginBottom: 6,
                  padding: 8,
                  fontSize: 14,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                }}
              />
              <button
                onClick={() => handleAddCorrection(p._id)}
                style={{
                  backgroundColor: '#1877f2',
                  color: 'white',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Gửi sửa
              </button>
            </div>
          )}

          {/* Comments */}
          <div style={{ borderTop: '1px solid #ddd', paddingTop: 12 }}>
            {comments[p._id]?.length ? (
              comments[p._id].map(c => (
                <div
                  key={c._id}
                  style={{
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid #eee',
                    fontSize: 14,
                    color: '#222',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Avatar comment */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#bbb',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 16,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      userSelect: 'none',
                      flexShrink: 0,
                    }}
                  >
                    {(c.userId?.username || c.userId?.email || 'A')[0].toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{c.userId?.username || c.userId?.email || 'Anonymous'}</span>
                      <span style={{ fontSize: 12, color: '#666', fontWeight: 'normal' }}>{timeAgo(c.createdAt)}</span>
                    </div>
                    <div>{c.content}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontStyle: 'italic', color: '#777' }}>Chưa có bình luận</div>
            )}

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <input
                value={newComment[p._id] || ''}
                onChange={e => setNewComment(prev => ({ ...prev, [p._id]: e.target.value }))}
                placeholder="Viết bình luận..."
                style={{
                  flex: 1,
                  padding: 8,
                  fontSize: 14,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                }}
              />
              <button
                disabled={!newComment[p._id]?.trim()}
                onClick={() => handleAddComment(p._id)}
                style={{
                  backgroundColor: '#1877f2',
                  color: 'white',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: 4,
                  cursor: newComment[p._id]?.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
