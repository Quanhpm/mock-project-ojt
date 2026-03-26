import React, { useState } from 'react'
import { deleteUser } from '@/apis'
import { X, AlertTriangle } from "lucide-react";

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
            const message = err instanceof Error ? err.message : 'Failed to delete user.'
            setError(message)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 999,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    padding: "8px"
                }}
            >
                {/* Modal */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: "white",
                        borderRadius: "12px",
                        width: "100%",
                        maxWidth: "480px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        overflow: "hidden",
                        maxHeight: "calc(100dvh - 16px)"
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                                backgroundColor: "#ffebee",
                                padding: "10px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <AlertTriangle size={24} color="#f44336" />
                            </div>
                            <h2 style={{
                                margin: 0,
                                fontSize: "20px",
                                fontWeight: "600",
                                color: "#212529"
                            }}>
                                Delete User
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                                color: "#6c757d"
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "20px" }}>
                        <p style={{
                            margin: 0,
                            marginBottom: "16px",
                            fontSize: "15px",
                            color: "#495057",
                            lineHeight: "1.6"
                        }}>
                            Are you sure you want to delete user <span style={{ fontWeight: "600", color: "#212529" }}>"{userName}"</span>? This action cannot be undone.
                        </p>
                        
                        <div style={{
                            backgroundColor: "#f8f9fa",
                            padding: "16px",
                            borderRadius: "8px",
                            border: "1px solid #e9ecef",
                            marginBottom: error ? "16px" : "0"
                        }}>
                            <div style={{ marginBottom: "8px" }}>
                                <span style={{
                                    fontSize: "12px",
                                    color: "#6c757d",
                                    textTransform: "uppercase",
                                    fontWeight: "600"
                                }}>
                                    User ID
                                </span>
                                <p style={{
                                    margin: "4px 0 0 0",
                                    fontSize: "14px",
                                    color: "#212529",
                                    fontWeight: "500"
                                }}>
                                    {userId}
                                </p>
                            </div>
                            <div>
                                <span style={{
                                    fontSize: "12px",
                                    color: "#6c757d",
                                    textTransform: "uppercase",
                                    fontWeight: "600"
                                }}>
                                    User Name
                                </span>
                                <p style={{
                                    margin: "4px 0 0 0",
                                    fontSize: "14px",
                                    color: "#212529",
                                    fontWeight: "500"
                                }}>
                                    {userName}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                padding: "12px",
                                backgroundColor: "#ffebee",
                                border: "1px solid #ffcdd2",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "8px"
                            }}>
                                <AlertTriangle size={18} color="#d32f2f" style={{ marginTop: "2px" }} />
                                <p style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    color: "#b71c1c"
                                }}>{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: "16px 20px",
                        borderTop: "1px solid #f0f0f0",
                        display: "flex",
                        flexDirection: "column-reverse",
                        gap: "12px",
                        justifyContent: "space-between"
                    }}>
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
                            style={{
                                padding: "10px 20px",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "500",
                                cursor: isDeleting ? "not-allowed" : "pointer",
                                backgroundColor: "white",
                                color: "#374151",
                                opacity: isDeleting ? 0.7 : 1,
                                transition: "all 0.2s",
                                width: "100%"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            style={{
                                padding: "10px 20px",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: isDeleting ? "not-allowed" : "pointer",
                                backgroundColor: "#f44336",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                opacity: isDeleting ? 0.7 : 1,
                                width: "100%",
                                justifyContent: "center"
                            }}
                        >
                            {isDeleting ? "Deleting..." : "Delete User"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
