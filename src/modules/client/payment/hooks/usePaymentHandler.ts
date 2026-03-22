import useToast from "@/hooks/use-toast.hook";
import { useNavigate } from "react-router-dom";
import { useState } from "react"
import { confirmPayment } from "@/apis/endpointsCLIENT/payment.api";

export function usePaymentHandler(paymentId: string) {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("CASH");
  const [showQr, setShowQr] = useState(false);

  // const isQrMethod = (method: string) =>
  //   method !== "CASH" && method !== "CARD";

  const handleConfirm = async () => {
    setPaying(true);
    try {
      await confirmPayment(paymentId, { method: selectedPayment });

      // Chỉ show QR sau khi confirm thành công
      // if (isQrMethod(selectedPayment)) setShowQr(true);

      success("Thanh toán thành công");
    } catch (e) {
      console.error("Payment error:", e);
      error("Thanh toán thất bại");
    } finally {
      setPaying(false);
    }
  };

  return {
    paying,
    selectedPayment,
    setSelectedPayment,
    showQr,
    setShowQr,
    handleConfirm,
  };
}