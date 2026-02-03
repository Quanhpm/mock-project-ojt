import React from 'react'
import type { User } from '../hooks/useUserList.hook'

interface UserTableRowProps {
  user: User
  onToggleStatus: (userId: number) => void
  onEdit: (userId: number) => void
  onDelete: (userId: number) => void
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  return (
    <tr className="group hover:bg-slate-50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="h-10 w-10 rounded-full bg-cover bg-center shrink-0 border border-slate-200"
            style={{
              backgroundImage: `url('${user.avatar_url}')`,
            }}
          />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{user.name}</span>
            <span className="text-sm text-slate-500">{user.email}</span>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          User
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">
            storefront
          </span>
          <span className="text-slate-700">N/A</span>
        </div>
      </td>
      <td className="p-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={user.is_active}
            onChange={() => onToggleStatus(user.id)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onEdit(user.id)}
            className="text-slate-600 hover:text-primary hover:bg-slate-100 p-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="text-slate-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  )
}
