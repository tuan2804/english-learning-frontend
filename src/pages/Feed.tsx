import React, { useEffect, useState } from 'react'
import { fetchPosts, createPost } from '../api/posts'
import { useNavigate } from 'react-router-dom'

type Post = {
  _id: string
  title: string
  content: string
  category: string
  user?: { username?: string; email?: string }
  createdAt?: string
}

export default function Feed(){
  const [posts,setPosts]=useState<Post[]>([])
  const [title,setTitle]=useState('')
  const [content,setContent]=useState('')
  const [category,setCategory]=useState('Writing')
  const token = localStorage.getItem('token') || undefined
  const navigate = useNavigate()

  const load = async()=>{
    try{
      const res = await fetchPosts()
      setPosts(res.data)
    }catch(err){ console.error(err) }
  }

  useEffect(()=>{ load() },[])

  const handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault()
    try{
      await createPost({ title, content, category }, token)
      setTitle(''); setContent('')
      load()
    }catch(err:any){
      alert(err?.response?.data?.message || 'Post failed')
    }
  }

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

      <form className="form" onSubmit={handleSubmit}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Tiêu đề" />
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Nội dung" />
        <select value={category} onChange={e=>setCategory(e.target.value)}>
          <option>Writing</option>
          <option>Grammar</option>
          <option>Vocabulary</option>
        </select>
        <button className="button" type="submit">Đăng bài</button>
      </form>

      <hr />

      {posts.map(p=>(
        <div key={p._id} className="post">
          <h3>{p.title}</h3>
          <p>{p.content}</p>
          <div className="small">{p.category} • {p.user?.username || p.user?.email || 'Anonymous'}</div>
        </div>
      ))}
    </div>
  )
}
