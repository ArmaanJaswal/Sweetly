import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Reading from '../components/Reading'
import ReadingForm from '../components/ReadingForm'
import { formatDate, groupByDate, sortReadings } from '../utils/readings'

const ReadingsPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchData =async()=>{
        try{
            const readings = await axios.get("http://localhost:3000/api/readings",{withCredentials:true});

            setData(readings.data.reading)
            setError("")
        }catch(err){
            // Session expired, send back to login
            if(err.response?.status === 401){
                localStorage.removeItem("isLoggedIn");
                return navigate("/login");
            }
            setError(err.response?.data?.message || "Something went wrong");
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchData();
    },[])

    // Newest day first, grouped by date
    const days = groupByDate(sortReadings(data,{newestFirst:true}));

  return (
    <div>
        <div className='mb-6'>
            <h1 className='text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl'>Your readings</h1>
            <p className='mt-1 text-slate-500'>Log up to four readings a day: fasting, and after each meal.</p>
        </div>

        <div className='mb-8 rounded-2xl border border-red-100 bg-white p-5 shadow-sm shadow-red-100/50 sm:p-6'>
            <h2 className='mb-4 font-semibold text-slate-900'>Add a reading</h2>
            <ReadingForm onSaved={fetchData}/>
        </div>

        {loading && <p className='py-12 text-center text-slate-500'>Loading...</p>}

        {!loading && error && (
            <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'>{error}</div>
        )}

        {!loading && !error && days.length === 0 && (
            <div className='rounded-2xl border border-dashed border-red-200 bg-white px-6 py-12 text-center'>
                <h3 className='font-semibold text-slate-800'>No readings yet</h3>
                <p className='mt-1 text-sm text-slate-500'>Add your first reading above to start tracking.</p>
            </div>
        )}

        <div className='space-y-4'>
            {
                days.map((day)=>{
                    return (
                        <div key={day.date} className='rounded-2xl border border-red-100 bg-white px-5 py-4 shadow-sm shadow-red-100/50 sm:px-6'>
                            <h3 className='text-sm font-semibold uppercase tracking-wide text-red-600'>{formatDate(day.date)}</h3>
                            <ul className='divide-y divide-slate-100'>
                                {
                                    day.readings.map((reading)=>{
                                        return <Reading key={reading.id} reading={reading} fetchData={fetchData}/>
                                    })
                                }
                            </ul>
                        </div>
                    )
                })
            }
        </div>
    </div>
  )
}

export default ReadingsPage
