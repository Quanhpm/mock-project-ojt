import React from 'react'
import type { UserFranchiseRoleItem } from '../hooks/useUserList.hook'

interface UserTableRowProps {
  user: UserFranchiseRoleItem
}

/** Badge color theo role_name */
const getRoleBadgeStyle = (roleName: string) => {
  const upper = roleName.toUpperCase()
  if (upper.includes('ADMIN')) return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
  if (upper.includes('MANAGER')) return 'bg-blue-50 text-blue-700 ring-blue-700/10'
  if (upper.includes('STAFF')) return 'bg-amber-50 text-amber-700 ring-amber-600/20'
  return 'bg-slate-50 text-slate-700 ring-slate-600/20'
}

/** Kiểm tra franchise_id có phải "undefined" / "null" không */
const isGlobalFranchise = (franchiseId: string) => {
  return !franchiseId || franchiseId === 'undefined' || franchiseId === 'null'
}

export const UserTableRow: React.FC<UserTableRowProps> = ({ user }) => {
  const initial = user.user_name?.charAt(0)?.toUpperCase() || '?'

  return (
    <tr className="group hover:bg-slate-50 transition-colors">
      {/* USER */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-900 truncate">{user.user_name}</span>
            <span className="text-sm text-slate-500 truncate">{user.user_email}</span>
          </div>
        </div>
      </td>

      {/* ROLES */}
      <td className="p-4">
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getRoleBadgeStyle(user.role_name)}`}
        >
          {user.role_name}
        </span>
      </td>

      {/* FRANCHISE */}
      <td className="p-4">
        {isGlobalFranchise(user.franchise_id) ? (
          <div className="flex items-center gap-2 text-slate-500">
            <span className="material-symbols-outlined text-[18px]">public</span>
            <span className="font-medium">Global</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">storefront</span>
            <span className="text-slate-700 font-medium">{user.franchise_name}</span>
          </div>
        )}
      </td>

      {/* STATUS */}
      <td className="p-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={user.is_active}
            readOnly
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </td>
    </tr>
  )
}
