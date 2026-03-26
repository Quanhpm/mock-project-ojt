import React, { useState, useEffect, useCallback } from 'react'
import type { UserItem } from '../hooks'
import { getUserFranchiseRoles } from '@/apis'
import type { UserFranchiseRoleDetail } from '@/apis'

interface ViewUserModalProps {
    isOpen: boolean
    user: UserItem | null
    onClose: () => void
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

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
    isOpen,
    user,
    onClose,
}) => {
    const [roles, setRoles] = useState<UserFranchiseRoleDetail[]>([])
    const [error, setError] = useState<string | null>(null)

    const loadRoles = useCallback(async (targetUser: UserItem) => {
        setError(null)

        try {
            const data = await getUserFranchiseRoles(targetUser.id)
            setRoles(data || [])
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch roles')
        }
    }, [])

    const handleClose = () => {
        setRoles([])
        setError(null)
        onClose()
    }

    useEffect(() => {
        if (isOpen && user) {
            const timeoutId = window.setTimeout(() => {
                void loadRoles(user)
            }, 0)

            return () => window.clearTimeout(timeoutId)
        }
    }, [isOpen, loadRoles, user])

    if (!isOpen || !user) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-[calc(100vw-1rem)] sm:max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[85vh] overflow-hidden border border-gray-100">
                {/* ═══════════ Header ═══════════ */}
                <div className="flex items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 bg-cover bg-center"
                            style={{ backgroundImage: user.avatar_url ? `url(${user.avatar_url})` : 'none' }}>
                            {!user.avatar_url && (user.name?.charAt(0)?.toUpperCase() || '?')}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                {user.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">mail</span>
                                    {user.email}
                                </span>
                                {user.phone && (
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">phone</span>
                                        {user.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* ═══════════ Content ═══════════ */}
                <div className="overflow-y-auto bg-gray-50/50 flex-1 p-4 sm:p-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                            <h3 className="font-semibold text-gray-800">Assigned Roles & Franchises</h3>
                        </div>

                        {error ? (
                            <div className="p-6 flex flex-col items-center justify-center text-center gap-2">
                                <span className="material-symbols-outlined text-[32px] text-red-400">error</span>
                                <p className="text-red-600 font-medium">{error}</p>
                                <button
                                    onClick={() => {
                                        void loadRoles(user)
                                    }}
                                    className="mt-2 text-sm text-primary hover:underline"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : roles.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center gap-2">
                                <span className="material-symbols-outlined text-[32px] text-gray-300">work_off</span>
                                <p className="text-gray-600 font-medium">No roles assigned</p>
                                <p className="text-sm text-gray-400">This user does not have any specific system access.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                            <table className="min-w-[560px] w-full text-left text-sm">
                                <thead className="bg-white text-gray-500 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">Role</th>
                                        <th className="px-5 py-3 font-semibold">Franchise</th>
                                        <th className="px-5 py-3 font-semibold w-24 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {roles.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getRoleBadgeStyle(item.role_name)}`}>
                                                    {item.role_name}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {isGlobalFranchise(item.franchise_id) ? (
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <span className="material-symbols-outlined text-[18px]">public</span>
                                                        <span className="font-medium">Global Access</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-slate-400 text-[18px]">storefront</span>
                                                        <span className="text-slate-700 font-medium">{item.franchise_name}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-center">
                                                    {item.is_active && !item.is_deleted ? (
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Inactive
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══════════ Footer ═══════════ */}
                <div className="flex items-center justify-start px-4 sm:px-6 py-4 bg-white border-t border-gray-100">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm w-full sm:w-auto"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
