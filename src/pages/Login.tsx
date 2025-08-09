import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as apiLogin } from '../api/auth'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const navigate = useNavigate()

  const handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault()
    try{
      const res = await apiLogin({ email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/feed')
    }catch(err:any){
      alert(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="container">
      <div className="header"><h2>Đăng nhập</h2><Link to="/register">Đăng ký</Link></div>
      <form className="form" onSubmit={handleSubmit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu" />
        <button className="button" type="submit">Đăng nhập</button>
      </form>
    </div>
  )
}