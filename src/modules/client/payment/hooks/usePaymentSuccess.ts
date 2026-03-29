import { useState, useEffect} from "react"
import { useLocation, useNavigate} from "react-router-dom"
import { usePaymentData } from "./usePaymentData";
import { usePaymentRefund } from "./usePaymentRefund";

export function usePaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const { handleRefund } = usePaymentRefund();
    const [showModal, setShowModal] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const state = location.state as { total?: string; paymentId?: string } | null;
    const total = state?.total ?? "";
    const paymentId = state?.paymentId ?? "";

    const { paymentData, userInfo, orderInfo } = usePaymentData(paymentId);
    const franchiseName = orderInfo?.franchise_name ?? "";

    useEffect(() => {
        if (!showSuccessPopup) return;
        const timer = setTimeout(() => {
            setShowSuccessPopup(false);
            navigate("/menu");
        }, 5000);
        return () => clearTimeout(timer);
    }, [showSuccessPopup, navigate]);

    const onConfirmRefund = async (message: string) => {
        try {
            await handleRefund({ paymentId, message });
            setShowModal(false);
            setShowSuccessPopup(true);
        } catch (error) {
            console.error("Refund failed:", error);
        }
    };

    return {
        total, paymentData, userInfo, franchiseName,
        showModal, setShowModal,
        showSuccessPopup, setShowSuccessPopup,
        onConfirmRefund,
        goToMenu: () => navigate("/menu"),
    };
}
