import React from 'react'
import { formatDate, formatSlot, sortReadings } from '../utils/readings'
import StatusBadge from './StatusBadge'

const ReportReadingsTable = ({readings}) => {
    const sorted = sortReadings(readings);

  return (
    <div className='overflow-x-auto rounded-2xl border border-red-100 bg-white'>
        <table className='w-full min-w-120 text-left text-sm'>
            <thead className='bg-red-50 text-xs uppercase tracking-wide text-red-700'>
                <tr>
                    <th className='px-4 py-3 font-semibold'>Date</th>
                    <th className='px-4 py-3 font-semibold'>Time of day</th>
                    <th className='px-4 py-3 font-semibold'>Value</th>
                    <th className='px-4 py-3 font-semibold'>Status</th>
                </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
                {
                    sorted.map((reading)=>{
                        return (
                            <tr key={reading.id} className='hover:bg-red-50/40'>
                                <td className='px-4 py-3 text-slate-700'>{formatDate(reading.readingDate)}</td>
                                <td className='px-4 py-3 text-slate-700'>{formatSlot(reading.slot)}</td>
                                <td className='px-4 py-3 font-semibold text-slate-900'>{reading.value} mg/dl</td>
                                <td className='px-4 py-3'><StatusBadge value={reading.value}/></td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    </div>
  )
}

export default ReportReadingsTable
