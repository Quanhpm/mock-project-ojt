import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyEmail } from '@/apis/endpoints/auth.api'
import { ROUTER_URL } from '@/routes/router.const'
import { showToast } from '@/components/ui/toast'

const VerifyUserEmailPage: React.FC = () => {
    const { token } = useParams<{ token: string }>()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleConfirm = async () => {
        if (!token) {
            setErrorMessage('Token is missing.')
            setStatus('error')
            return
        }

        setIsLoading(true)
        setStatus('idle')
        setErrorMessage(null)

        try {
            await verifyEmail(token)
            setStatus('success')
            showToast('Email verified successfully! You can now log in.', 'success', {
                description: 'Success'
            })
            // Redirect sau 2 giây để user kịp đọc thông báo
            setTimeout(() => {
                navigate(ROUTER_URL.ADMIN_ROUTER.LOGIN, { replace: true })
            }, 2000)
        } catch (error: any) {
            setStatus('error')
            const msg = error?.response?.data?.message || error?.message || 'Failed to verify email.'
            setErrorMessage(msg)
            showToast(msg, 'error', {
                description: 'Verification Failed'
            })
            // Redirect sau 2.5 giây khi lỗi
            setTimeout(() => {
                navigate(ROUTER_URL.ADMIN_ROUTER.LOGIN, { replace: true })
            }, 2500)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
                <div className="mx-auto mb-6 flex items-center justify-center w-12 h-12 text-gray-800">
                    <span className="material-symbols-outlined text-[32px]">
                        mail
                    </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                    Xác thực Email
                </h2>

                <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                    Cảm ơn bạn đã đăng ký tài khoản. Vui lòng bấm vào nút bên dưới để
                    xác nhận địa chỉ email của bạn và hoàn tất quá trình thiết lập.
                </p>

                {status === 'error' && errorMessage && (
                    <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-left">
                        <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0 mt-0.5">
                            error
                        </span>
                        <p className="text-sm text-red-700 leading-snug">{errorMessage}</p>
                    </div>
                )}

                {status === 'success' ? (
                    <div className="p-4 bg-green-50 rounded-xl flex flex-col items-center justify-center text-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-green-500 text-[28px]">
                            check_circle
                        </span>
                        <p className="text-sm font-medium text-green-800">
                            Xác thực thành công! Đang chuyển hướng...
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || !token}
                        className="w-full py-3 px-4 bg-[#7D5A45] hover:bg-[#6c4830] text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">
                                    progress_activity
                                </span>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">
                                    check_circle
                                </span>
                                Xác nhận
                            </>
                        )}
                    </button>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
                    Nếu bạn không phải là người yêu cầu, vui lòng bỏ qua trang này.
                </div>
            </div>
        </div>
    )
}

export default VerifyUserEmailPage
