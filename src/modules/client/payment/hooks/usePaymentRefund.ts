import { refundPayment } from "@/apis/endpointsCLIENT/payment.api";
import useToast from "@/hooks/use-toast.hook";

interface PaymentRefundProps {
  paymentId: string;
  message: string;
}

export function usePaymentRefund() {
  const { success, error } = useToast();

  const handleRefund = async ({ paymentId, message }: PaymentRefundProps) => {
    if (!paymentId) {
      error("Không tìm thấy thanh toán để hoàn tiền");
      return false;
    }

    try {
      await refundPayment(paymentId, { refund_reason: message });
      success("Hoàn tiền thành công");
      return true;
    } catch (exception) {
      console.error("Payment error:", exception);
      error("Hoàn tiền thất bại");
      return false;
    }
  };

  return {
    handleRefund,
  };
}
