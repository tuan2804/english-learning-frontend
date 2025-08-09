import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register as apiRegister } from '../api/auth'

export default function Register(){
  const [username,setUsername]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const navigate = useNavigate()

  const handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault()
    try{
      await apiRegister({ username, email, password })
      alert('Đăng ký thành công. Vui lòng đăng nhập.')
      navigate('/login')
    }catch(err:any){
      alert(err?.response?.data?.message || 'Register failed')
    }
  }

  return (
    <div className="container">
      <div className="header"><h2>Đăng ký</h2><Link to="/login">Đăng nhập</Link></div>
      <form className="form" onSubmit={handleSubmit}>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Tên" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu" />
        <button className="button" type="submit">Đăng ký</button>
      </form>
    </div>
  )
}