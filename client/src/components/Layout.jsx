import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// Wraps every page that needs a logged in user
const Layout = () => {
    if(!localStorage.getItem("isLoggedIn")){
        return <Navigate to="/login" replace/>
    }

  return (
    <div className='flex min-h-screen flex-col'>
        <Navbar/>
        <main className='mx-auto w-full max-w-5xl flex-1 px-4 py-8'>
            <Outlet/>
        </main>
        <footer className='py-6 text-center text-xs text-slate-400'>
            Sweety helps you track readings. It is not medical advice, so talk to your doctor about your targets.
        </footer>
    </div>
  )
}

export default Layout
