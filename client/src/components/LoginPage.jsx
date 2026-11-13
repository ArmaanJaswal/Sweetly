import axios from 'axios'
import React from 'react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setformData] = useState({
        email:"",
        password:""
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange =(e)=>{
        setformData({...formData,
            [e.target.name]:e.target.value
        })
    }

    const handleSubmit =async (e)=>{
        e.preventDefault();
        setError("");
        setLoading(true);
        try{
            await axios.post("http://localhost:3000/api/auth/login",formData,{withCredentials:true});
            localStorage.setItem("isLoggedIn","true");
            setformData({
                email:"",
                password:""
            })
            navigate("/readings");
        }catch(err){
            setError(err.response?.data?.message || "Something went wrong");
        }finally{
            setLoading(false);
        }
    }

    // Already logged in, no need to see the login page
    if(localStorage.getItem("isLoggedIn")){
        return <Navigate to="/readings" replace/>
    }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-white px-4 py-12'>
        <div className='w-full max-w-md'>
            <div className='mb-8 flex flex-col items-center text-center'>
                <Logo large/>
                <p className='mt-3 text-slate-500'>Keep your blood sugar in check, one reading at a time.</p>
            </div>

            <div className='rounded-2xl border border-red-100 bg-white p-6 shadow-sm shadow-red-100/50'>
                <h2 className='text-xl font-bold text-slate-900'>Welcome back</h2>
                <p className='mt-1 text-sm text-slate-500'>Log in to see your readings.</p>

                <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
                    {location.state?.registered && !error && (
                        <div className='rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'>Account created. You can log in now.</div>
                    )}
                    {error && (
                        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'>{error}</div>
                    )}

                    <label className='block'>
                        <span className='mb-1.5 block text-sm font-medium text-slate-700'>Email</span>
                        <input onChange={handleChange} value={formData.email} name='email' type="email" required placeholder='Enter your email here'
                            className='w-full rounded-lg border border-slate-200 px-3 py-2 placeholder:text-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100'/>
                    </label>
                    <label className='block'>
                        <span className='mb-1.5 block text-sm font-medium text-slate-700'>Password</span>
                        <input onChange={handleChange} value={formData.password} name='password' type="password" required placeholder='Enter your password here'
                            className='w-full rounded-lg border border-slate-200 px-3 py-2 placeholder:text-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100'/>
                    </label>

                    <button type='submit' disabled={loading}
                        className='w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-red-200 hover:bg-red-700 disabled:opacity-60'>
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>
            </div>

            <p className='mt-6 text-center text-sm text-slate-600'>
                New here? <Link to="/signup" className='font-semibold text-red-600 hover:text-red-700'>Create an account</Link>
            </p>
        </div>
    </div>
  )
}

export default LoginPage
