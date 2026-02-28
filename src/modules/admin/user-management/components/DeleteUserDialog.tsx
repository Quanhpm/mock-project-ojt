import React, { useState } from 'react'
import { deleteUser } from '@/apis'

interface DeleteUserDialogProps {
    isOpen: boolean
    userId: string
    userName: string
    onClose: () => void
    onSuccess: () => void
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
    isOpen,
    userId,
    userName,
    onClose,
    onSuccess,
}) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleDelete = async () => {
        setIsDeleting(true)
        setError(null)
        try {
            await deleteUser(userId)
            onSuccess()
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Failed to delete user.'
            setError(message)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Icon + Content */}
                <div className="p-6 text-center">
                    <div className="mx-auto mb-4 flex items-center justify-center size-14 rounded-full bg-red-100">
                        <span className="material-symbols-outlined text-red-600 text-[28px]">
                            warning
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User</h3>
                    <p className="text-sm text-gray-600">
                        Bạn có chắc chắn muốn xóa người dùng{' '}
                        <span className="font-semibold text-gray-900">"{userName}"</span>{' '}
                        không? Hành động này không thể hoàn tác.
                    </p>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-left">
                            <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">
                                error
                            </span>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold shadow-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                    >
                        {isDeleting ? (
                            <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">
                                    progress_activity
                                </span>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
