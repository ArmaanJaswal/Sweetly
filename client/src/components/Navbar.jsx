import axios from 'axios'
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'

const Navbar = () => {
    const navigate = useNavigate();

    const linkClass = ({isActive})=>{
        return isActive
            ? "rounded-lg px-3 py-2 text-sm font-medium bg-red-50 text-red-700"
            : "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }

    const handleLogout =async()=>{
        try{
            await axios.post("http://localhost:3000/api/auth/logout",{},{withCredentials:true});
        }catch(err){
            console.log("Error while logging out",err);
        }
        localStorage.removeItem("isLoggedIn");
        navigate("/login");
    }

  return (
    <header className='sticky top-0 z-10 border-b border-red-100 bg-white/90 backdrop-blur'>
        <nav className='mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3'>
            <NavLink to="/readings">
                <Logo/>
            </NavLink>
            <div className='flex items-center gap-1'>
                <NavLink to="/readings" className={linkClass}>Readings</NavLink>
                <NavLink to="/reports" className={linkClass}>Reports</NavLink>
                <button onClick={handleLogout} className='ml-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100'>Log out</button>
            </div>
        </nav>
    </header>
  )
}

export default Navbar
