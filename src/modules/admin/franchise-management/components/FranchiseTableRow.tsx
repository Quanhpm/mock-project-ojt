import React from 'react'

interface Franchise {
  id: string
  title: string
  contact: string
  location: string
  status: 'published' | 'draft' | 'inactive' | string
  createdAt: string
}

interface FranchiseTableRowProps {
  franchise: Franchise
  onEdit: (franchiseId: string) => void
  onDelete: (franchiseId: string) => void
  onToggleStatus: (franchiseId: string) => void
}

export const FranchiseTableRow: React.FC<FranchiseTableRowProps> = ({
  franchise,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Published'
      case 'draft':
        return 'Draft'
      case 'inactive':
        return 'Inactive'
      default:
        return status
    }
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="p-4">
        <div>
          <p className="font-medium text-slate-900">{franchise.title}</p>
          <p className="text-sm text-slate-500">{franchise.contact}</p>
        </div>
      </td>
      <td className="p-4 text-slate-900">{franchise.location}</td>
      <td className="p-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            franchise.status
          )}`}
        >
          {getStatusLabel(franchise.status)}
        </span>
      </td>
      <td className="p-4 text-sm text-slate-500">{franchise.createdAt}</td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(franchise.id)}
            className="p-2 text-slate-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            onClick={() => onToggleStatus(franchise.id)}
            className="p-2 text-slate-600 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer"
            title="Toggle Status"
          >
            <span className="material-symbols-outlined text-lg">
              {franchise.status === 'inactive' ? 'visibility' : 'visibility_off'}
            </span>
          </button>
          <button
            onClick={() => onDelete(franchise.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </td>
    </tr>
  )
}
