import React from 'react'
import StatusBadge from './StatusBadge'

const ReportStats = ({average, maximum, minimum, count}) => {
    const roundedAverage = Math.round(average * 10) / 10;

  return (
    <div className='grid gap-4 sm:grid-cols-3'>
        <div className='rounded-2xl border border-red-600 bg-red-600 p-5 text-white'>
            <h4 className='text-sm font-medium text-red-100'>Average of {count} reading{count === 1 ? "" : "s"}</h4>
            <p className='mt-2 text-3xl font-bold tracking-tight'>
                {roundedAverage}<span className='ml-1 text-base font-normal text-red-100'>mg/dl</span>
            </p>
            <div className='mt-3'><StatusBadge value={roundedAverage}/></div>
        </div>
        <div className='rounded-2xl border border-red-100 bg-white p-5'>
            <h4 className='text-sm font-medium text-slate-500'>Highest</h4>
            <p className='mt-2 text-3xl font-bold tracking-tight'>
                {maximum}<span className='ml-1 text-base font-normal text-slate-400'>mg/dl</span>
            </p>
            <div className='mt-3'><StatusBadge value={maximum}/></div>
        </div>
        <div className='rounded-2xl border border-red-100 bg-white p-5'>
            <h4 className='text-sm font-medium text-slate-500'>Lowest</h4>
            <p className='mt-2 text-3xl font-bold tracking-tight'>
                {minimum}<span className='ml-1 text-base font-normal text-slate-400'>mg/dl</span>
            </p>
            <div className='mt-3'><StatusBadge value={minimum}/></div>
        </div>
    </div>
  )
}

export default ReportStats
