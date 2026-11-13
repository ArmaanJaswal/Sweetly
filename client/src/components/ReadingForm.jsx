import axios from 'axios'
import React from 'react'
import { useState } from 'react'
import { SLOTS, formatSlot, today } from '../utils/readings'

// Used for adding a new reading, and for editing one when a reading is passed in
const ReadingForm = ({reading, onSaved, onCancel}) => {
    const [formData, setformData] = useState({
        date: reading ? reading.readingDate : today(),
        slot: reading ? reading.slot : SLOTS[0],
        value: reading ? reading.value : ""
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange =(e)=>{
        setformData({...formData,
            [e.target.name]:e.target.value
        })
    }

    const handleSubmit =async(e)=>{
        e.preventDefault();
        setError("");
        setLoading(true);
        try{
            if(reading){
                await axios.put(`http://localhost:3000/api/readings/edit/${reading.id}`,formData,{withCredentials:true});
            }else{
                await axios.post("http://localhost:3000/api/readings",formData,{withCredentials:true});
                setformData({...formData,value:""});
            }
            onSaved();
        }catch(err){
            setError(err.response?.data?.message || "Something went wrong");
        }finally{
            setLoading(false);
        }
    }

  return (
    <form onSubmit={handleSubmit} className='space-y-3'>
        {error && (
            <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'>{error}</div>
        )}
        <div className='grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end'>
            <label className='block'>
                <span className='mb-1.5 block text-sm font-medium text-slate-700'>Date</span>
                <input onChange={handleChange} value={formData.date} name='date' type="date" required max={today()}
                    className='w-full rounded-lg border border-slate-200 bg-white px-3 py-2 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100'/>
            </label>
            <label className='block'>
                <span className='mb-1.5 block text-sm font-medium text-slate-700'>Time of day</span>
                <select onChange={handleChange} value={formData.slot} name='slot'
                    className='w-full rounded-lg border border-slate-200 bg-white px-3 py-2 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100'>
                    {
                        SLOTS.map((slot)=>{
                            return <option key={slot} value={slot}>{formatSlot(slot)}</option>
                        })
                    }
                </select>
            </label>
            <label className='block'>
                <span className='mb-1.5 block text-sm font-medium text-slate-700'>Value (mg/dl)</span>
                <input onChange={handleChange} value={formData.value} name='value' type="number" required min={40} max={600} placeholder='e.g. 110'
                    className='w-full rounded-lg border border-slate-200 bg-white px-3 py-2 placeholder:text-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100'/>
            </label>
            <div className='flex gap-2'>
                <button type='submit' disabled={loading}
                    className='flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-red-200 hover:bg-red-700 disabled:opacity-60 sm:flex-none'>
                    {loading ? "Saving..." : reading ? "Save" : "Add reading"}
                </button>
                {onCancel && (
                    <button type='button' onClick={onCancel} className='rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100'>Cancel</button>
                )}
            </div>
        </div>
    </form>
  )
}

export default ReadingForm
