import axios from 'axios'
import React from 'react'
import { useState } from 'react'
import { formatSlot } from '../utils/readings'
import ReadingForm from './ReadingForm'
import StatusBadge from './StatusBadge'

const Reading = ({reading, fetchData}) => {
    const [editing, setEditing] = useState(false)
    const [error, setError] = useState("")

    const handleDelete =async()=>{
        if(!window.confirm("Delete this reading?")){
            return;
        }
        try{
            await axios.delete(`http://localhost:3000/api/readings/delete/${reading.id}`,{withCredentials:true});
            fetchData();
        }catch(err){
            setError(err.response?.data?.message || "Something went wrong");
        }
    }

    if(editing){
        return (
            <li className='py-4'>
                <ReadingForm
                    reading={reading}
                    onSaved={()=>{
                        setEditing(false);
                        fetchData();
                    }}
                    onCancel={()=>setEditing(false)}
                />
            </li>
        )
    }

  return (
    <li className='flex flex-wrap items-center gap-x-4 gap-y-2 py-3'>
        <h3 className='w-36 text-sm font-medium text-slate-600'>{formatSlot(reading.slot)}</h3>
        <h3 className='text-lg font-bold text-slate-900'>
            {reading.value} <span className='text-sm font-normal text-slate-400'>mg/dl</span>
        </h3>
        <StatusBadge value={reading.value}/>
        <div className='ml-auto flex gap-1'>
            <button onClick={()=>setEditing(true)} className='rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100'>Edit</button>
            <button onClick={handleDelete} className='rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50'>Delete</button>
        </div>
        {error && <p className='w-full text-sm text-red-600'>{error}</p>}
    </li>
  )
}

export default Reading
