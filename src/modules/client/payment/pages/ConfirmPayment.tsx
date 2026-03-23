import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTER_URL } from "@/routes/router.const";
import { formatDateTime } from "@/utils";
import { ConfirmRefundModal } from "../component/ConfirmRefundModal";
import {
  ActionButtons,
  CustomerInfo,
  PaymentDetails,
  SuccessHeader,
} from "../component/PaymentSuccessSections";
import { RefundSuccessPopup } from "../component/RefundSuccessPopup";
import { usePaymentData } from "../hooks/usePaymentData";
import { usePaymentRefund } from "../hooks/usePaymentRefund";
import { formatConfirmPaymentTotal } from "../service/confirm-payment.service";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleRefund } = usePaymentRefund();
  const [showModal, setShowModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const state = location.state as
    | { total?: number | string; paymentId?: string }
    | null;
  const total = state?.total;
  const paymentId = state?.paymentId ?? "";
  const formattedTotal = formatConfirmPaymentTotal(total);
  const { paymentData, userInfo, franchiseName } = usePaymentData(paymentId);
  const paidAtLabel = paymentData?.paid_at
    ? formatDateTime(paymentData.paid_at)
    : "Chưa cập nhật";

  useEffect(() => {
    if (!showSuccessPopup) return;

    const timer = setTimeout(() => {
      setShowSuccessPopup(false);
      navigate(ROUTER_URL.MENU);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showSuccessPopup, navigate]);

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] text-[var(--cf-primary)]">
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          <div className="overflow-hidden rounded-[2.5rem] border border-[rgba(176,137,104,0.14)] bg-white shadow-[0_20px_60px_-15px_rgba(74,55,40,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="border-b border-[rgba(176,137,104,0.14)] p-8 md:p-12 lg:border-b-0 lg:border-r lg:pr-16">
                <SuccessHeader />
                <CustomerInfo
                  address={userInfo?.address}
                  franchiseName={franchiseName}
                  name={userInfo?.name}
                  phone={userInfo?.phone}
                />
              </div>

              <div className="flex flex-col justify-between bg-white p-8 md:p-12 lg:pl-16">
                <PaymentDetails
                  formattedTotal={formattedTotal}
                  paidAt={paidAtLabel}
                  paymentCode={paymentData?.code}
                  paymentMethod={paymentData?.method}
                />

                <ActionButtons
                  onCancel={() => setShowModal(true)}
                  onGoHome={() => navigate(ROUTER_URL.MENU)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmRefundModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={async (message) => {
          try {
            await handleRefund({ paymentId, message });
            setShowModal(false);
            setShowSuccessPopup(true);
          } catch (error) {
            console.error("Refund failed:", error);
          }
        }}
      />

      {showSuccessPopup && (
        <RefundSuccessPopup onClose={() => setShowSuccessPopup(false)} />
      )}
    </>
  );
}
