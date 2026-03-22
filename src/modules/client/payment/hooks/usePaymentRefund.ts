import useToast from "@/hooks/use-toast.hook";
import { refundPayment } from "@/apis/endpointsCLIENT/payment.api";
import { useNavigate } from "react-router-dom";

interface PaymentRefundProps {
    paymentId: string;
    message: string;
}

export function usePaymentRefund() {
    const { success, error } = useToast();
    const navigate = useNavigate();

    const handleRefund = async ({ paymentId, message }: PaymentRefundProps) => {
        try {
            await refundPayment(paymentId, { refund_reason: message });
            success("Hoàn tiền thành công");
            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (e) {
            console.error("Payment error:", e);
            error("Hoàn tiền thất bại");
        }
    };

    return {
        handleRefund,
    };
}