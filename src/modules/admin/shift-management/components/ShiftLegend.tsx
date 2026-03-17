import React from 'react'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-700/10',
  ASSIGNED: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-700/10',
  CANCELED: 'bg-slate-100 text-slate-700 ring-slate-300',
  ABSENT: 'bg-red-50 text-red-700 ring-red-700/10',
}

export const ShiftLegend: React.FC = () => {
  const items = [
    { label: 'Pending', status: 'PENDING' },
    { label: 'Assigned', status: 'ASSIGNED' },
    { label: 'Completed', status: 'COMPLETED' },
    { label: 'Canceled', status: 'CANCELED' },
    { label: 'Absent', status: 'ABSENT' },
  ]

  return (
    <div className="flex max-w-[420px] flex-wrap justify-start gap-2 lg:justify-end">
      {items.map((item) => (
        <span
          key={item.status}
          className={`inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
            STATUS_STYLES[item.status]
          }`}
        >
          {item.label}
        </span>
      ))}
    </div>
  )
}
