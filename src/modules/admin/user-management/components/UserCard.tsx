import React from 'react'
import type { UserFranchiseRole } from '@/types/user.type'

interface UserCardProps {
  id: number
  name: string
  email: string
  avatar_url: string
  is_active: boolean
  franchiseName?: string
  roleCode?: string
  onEdit: (id: number) => void
  onViewProfile: (id: number) => void
}

const getRoleBadgeColor = (roleCode: string) => {
  const colors: Record<string, { bg: string; text: string; ring: string }> = {
    SUPER_ADMIN: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      ring: 'ring-red-700/10 dark:ring-red-400/30'
    },
    FRANCHISE_MANAGER: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      ring: 'ring-blue-700/10 dark:ring-blue-400/30'
    },
    STAFF: {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-300',
      ring: 'ring-amber-600/20 dark:ring-amber-500/30'
    },
    CUSTOMER: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      ring: 'ring-green-600/20 dark:ring-green-500/30'
    }
  }
  return colors[roleCode] || colors.STAFF
}

const getRoleLabel = (roleCode: string) => {
  const labels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    FRANCHISE_MANAGER: 'Manager',
    STAFF: 'Staff',
    CUSTOMER: 'Customer'
  }
  return labels[roleCode] || roleCode
}

export function UserCard({
  id,
  name,
  email,
  avatar_url,
  is_active,
  franchiseName = '-',
  roleCode = 'STAFF',
  onEdit,
  onViewProfile
}: UserCardProps) {
  const badgeColor = getRoleBadgeColor(roleCode)

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 relative group hover:shadow-md transition-shadow">
      {/* Menu button */}
      <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="material-symbols-outlined">more_vert</span>
      </button>

      {/* Avatar + Name */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="size-16 rounded-full bg-cover bg-center border-2 border-slate-100 dark:border-slate-700"
            style={{
              backgroundImage: `url('${avatar_url}')`
            }}
          />
          {/* Status indicator */}
          <span
            className={`absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white dark:border-surface-dark ${
              is_active ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{email}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />

      {/* Role + Franchise info */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            Role
          </span>
          <span
            className={`inline-flex items-center rounded-md ${badgeColor.bg} px-2.5 py-1 text-xs font-medium ${badgeColor.text} ring-1 ring-inset ${badgeColor.ring}`}
          >
            {getRoleLabel(roleCode)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            Franchise
          </span>
          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
            <span className="text-sm font-medium">{franchiseName}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => onEdit(id)}
          className="flex-1 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
        >
          Edit
        </button>
        <button
          onClick={() => onViewProfile(id)}
          className="flex-1 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
        >
          View Profile
        </button>
      </div>
    </div>
  )
}
