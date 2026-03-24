import useToast from "@/hooks/use-toast.hook";
import { useState } from "react"
import { confirmPayment } from "@/apis/endpointsCLIENT/payment.api";

export function usePaymentHandler(paymentId: string) {
  const { success, error } = useToast();
  const [paying, setPaying] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("CASH");
  const [showQr, setShowQr] = useState(false);

  // const isQrMethod = (method: string) =>
  //   method !== "CASH" && method !== "CARD";

  const handleConfirm = async () => {
    if (!paymentId) {
      error("Chưa có paymentId");
      return null;
    }

    setPaying(true);
    try {
      const response = await confirmPayment(paymentId, { method: selectedPayment });
      success("Thanh toán thành công");
      return response;
    } catch (e) {
      console.error("Payment error:", e);
      error("Thanh toán thất bại");
      return null;
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
