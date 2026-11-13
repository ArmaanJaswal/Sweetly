import React from 'react'
import { getStatus } from '../utils/readings'

const StatusBadge = ({value}) => {
    const status = getStatus(value);

    let label = "In range";
    let colors = "bg-emerald-50 text-emerald-700 ring-emerald-200";

    if(status === "low"){
        label = "Low";
        colors = "bg-amber-50 text-amber-700 ring-amber-200";
    }
    if(status === "high"){
        label = "High";
        colors = "bg-red-50 text-red-700 ring-red-200";
    }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colors}`}>
        {label}
    </span>
  )
}

export default StatusBadge
