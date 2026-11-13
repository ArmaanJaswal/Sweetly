import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReportReadingsTable from '../components/ReportReadingsTable'
import ReportStats from '../components/ReportStats'
import { formatDate, today } from '../utils/readings'

const REPORT_TYPES = [
    { key: "daily", label: "Daily" },
    { key: "this-month", label: "This month" },
    { key: "previous-month", label: "Previous month" },
]

const ReportPage = () => {
    const navigate = useNavigate();
    const [type, setType] = useState("daily")
    const [date, setDate] = useState(today())
    const [report, setReport] = useState(null)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)

    const fetchData =async()=>{
        setLoading(true);
        try{
            let url = `http://localhost:3000/api/report/${type}`;
            if(type === "daily"){
                url = `http://localhost:3000/api/report/daily?date=${date}`;
            }

            const res = await axios.get(url,{withCredentials:true});

            setReport(res.data)
            setMessage("")
        }catch(err){
            if(err.response?.status === 401){
                localStorage.removeItem("isLoggedIn");
                return navigate("/login");
            }
            
            setReport(null)
            setMessage(err.response?.data?.message || "Something went wrong")
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchData();
    },[type,date])

  return (
    <div>
        <div className='mb-6'>
            <h1 className='text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl'>Reports</h1>
            <p className='mt-1 text-slate-500'>See your average, highest and lowest readings over time.</p>
        </div>

        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='inline-flex rounded-xl border border-red-100 bg-white p-1'>
                {
                    REPORT_TYPES.map((t)=>{
                        return (
                            <button
                                key={t.key}
                                onClick={()=>setType(t.key)}
                                className={type === t.key
                                    ? 'flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm sm:flex-none sm:px-4'
                                    : 'flex-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 sm:flex-none sm:px-4'}
                            >
                                {t.label}
                            </button>
                        )
                    })
                }
            </div>

            {type === "daily" && (
                <input
                    type="date"
                    value={date}
                    max={today()}
                    onChange={(e)=>{
                        if(e.target.value){
                            setDate(e.target.value)
                        }
                    }}
                    className='rounded-lg border border-slate-200 bg-white px-3 py-2 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100'
                />
            )}
        </div>

        {loading && <p className='py-12 text-center text-slate-500'>Loading...</p>}

        {!loading && message && (
            <div className='rounded-2xl border border-dashed border-red-200 bg-white px-6 py-12 text-center'>
                <h3 className='font-semibold text-slate-800'>No report to show</h3>
                <p className='mt-1 text-sm text-slate-500'>{message}</p>
            </div>
        )}

        {!loading && report && (
            <div className='space-y-6'>
                <p className='text-sm text-slate-500'>
                    {report.startTime
                        ? `${formatDate(report.startTime)} to ${formatDate(report.endTime)}`
                        : formatDate(date)}
                </p>
                <ReportStats
                    average={report.average}
                    maximum={report.maximum}
                    minimum={report.minimum}
                    count={report.readings.length}
                />
                <ReportReadingsTable readings={report.readings}/>
                <p className='text-xs text-slate-400'>
                    Status uses a general target range of 70 to 180 mg/dl. Your doctor may set a different target for you.
                </p>
            </div>
        )}
    </div>
  )
}

export default ReportPage
