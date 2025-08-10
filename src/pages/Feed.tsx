import React, { useEffect, useState } from 'react'
import { fetchPosts, createPost } from '../api/posts'
import { fetchComments, createComment, toggleVote } from '../api/comments'
import { useNavigate } from 'react-router-dom'

type Post = {
  _id: string
  title: string
  content: string
  category: string
  user?: { username?: string; email?: string }
}

type Comment = {
  _id: string
  content: string
  userId?: { username?: string; email?: string }
  votes: number
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Writing')
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const token = localStorage.getItem('token') || undefined
  const navigate = useNavigate()

  const loadPosts = async () => {
    try {
      const res = await fetchPosts()
      setPosts(res.data)
      res.data.forEach((p: Post) => loadComments(p._id))
    } catch (err) {
      console.error(err)
    }
  }

  const loadComments = async (postId: string) => {
    try {
      const res = await fetchComments(postId)
      setComments(prev => ({ ...prev, [postId]: res.data }))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { loadPosts() }, [])

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPost({ title, content, category }, token)
      setTitle('')
      setContent('')
      loadPosts()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Post failed')
    }
  }

  const handleAddComment = async (postId: string) => {
    try {
      const res = await createComment(postId, newComment[postId], token);
      setComments(prev => ({
        ...prev,
        [postId]: [res.data, ...(prev[postId] || [])]
      }));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Comment failed');
    }
  };

  const handleVote = async (commentId: string, type: 'up' | 'down', postId: string) => {
    try {
      await toggleVote(commentId, type, token);
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId]?.map(c =>
          c._id === commentId ? { ...c, votes: c.votes + (type === 'up' ? 1 : -1) } : c
        )
      }));
    } catch (err) {
      console.error(err);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="container">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Bảng Phản Hồi Cộng Đồng</h2>
        <button onClick={handleLogout} className="button">Đăng xuất</button>
      </div>

      <form className="form" onSubmit={handleSubmitPost}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề" />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Nội dung" />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Writing</option>
          <option>Grammar</option>
          <option>Vocabulary</option>
        </select>
        <button className="button" type="submit">Đăng bài</button>
      </form>

      <hr />

      {posts.map(p => (
        <div key={p._id} className="post" style={{ marginBottom: 30 }}>
          <h3>{p.title}</h3>
          <p>{p.content}</p>
          <div className="small">{p.category} • {p.user?.username || p.user?.email || 'Anonymous'}</div>

          <div className="comments" style={{ marginTop: 10, paddingLeft: 20 }}>
            {comments[p._id]?.length ? (
              comments[p._id].map(c => (
                <div
                  key={c._id}
                  style={{
                    marginBottom: 8,
                    borderBottom: '1px solid #eee',
                    paddingBottom: 5
                  }}
                >
                  <b>{c.userId?.username || c.userId?.email || 'Anonymous'}:</b>{c.content}
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    <button onClick={() => handleVote(c._id, 'up', p._id)}>👍</button>
                    <button onClick={() => handleVote(c._id, 'down', p._id)}>👎</button>
                    <span style={{ marginLeft: 5 }}>{c.votes}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontStyle: 'italic', color: '#777' }}>Chưa có bình luận</div>
            )}

            {/* Ô nhập bình luận */}
            <div style={{ marginTop: 8, display: 'flex', gap: 5 }}>
              <input
                value={newComment[p._id] || ''}
                onChange={e => setNewComment(prev => ({ ...prev, [p._id]: e.target.value }))}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newComment[p._id]?.trim()) {
                    e.preventDefault()
                    handleAddComment(p._id)
                  }
                }}
                placeholder="Viết bình luận..."
                style={{ flex: 1 }}
              />
              <button
                disabled={!newComment[p._id]?.trim()}
                onClick={() => handleAddComment(p._id)}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
