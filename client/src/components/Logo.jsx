import React from 'react'

const Logo = ({large}) => {
  return (
    <div className='flex items-center gap-2'>
        <span className={`flex items-center justify-center rounded-xl bg-red-600 text-white ${large ? 'h-12 w-12' : 'h-9 w-9'}`}>
            <svg viewBox='0 0 24 24' fill='currentColor' className={large ? 'h-7 w-7' : 'h-5 w-5'}>
                <path d='M12 2.5c-.3 0-.6.15-.8.4C9.6 5 5 11.1 5 15a7 7 0 0 0 14 0c0-3.9-4.6-10-6.2-12.1a1 1 0 0 0-.8-.4Z' />
            </svg>
        </span>
        <span className={`font-bold tracking-tight text-slate-900 ${large ? 'text-3xl' : 'text-xl'}`}>Sweety</span>
    </div>
  )
}

export default Logo
