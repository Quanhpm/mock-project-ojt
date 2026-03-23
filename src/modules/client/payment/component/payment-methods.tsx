import type { ReactNode } from "react";
import { Banknote, CreditCard } from "lucide-react";
import momoIcon from "./assets/momo.webp";
import vnpayIcon from "./assets/vnpay.webp";

export type PaymentMethod = {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  iconClassName: string;
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: "CASH",
    label: "Tiền mặt",
    description: "Thanh toán khi nhận hàng hoặc tại quầy.",
    icon: <Banknote className="h-5 w-5" />,
    iconClassName: "bg-[var(--cf-accent-light)] text-[var(--cf-primary)]",
  },
  {
    id: "MOMO",
    label: "Ví MoMo",
    description: "Quét QR và xác nhận nhanh bằng ví điện tử.",
    icon: <img alt="MoMo" className="h-6 w-6 object-contain" src={momoIcon} />,
    iconClassName: "bg-[#ffe3f2] text-[#a50064]",
  },
  {
    id: "CARD",
    label: "Thẻ ngân hàng",
    description: "Phù hợp cho thanh toán online trực tiếp.",
    icon: <CreditCard className="h-5 w-5" />,
    iconClassName: "bg-[var(--cf-surface)] text-[var(--cf-primary)]",
  },
  {
    id: "VNPAY",
    label: "VNPay",
    description: "Thanh toán qua cổng nội địa nhanh và ổn định.",
    icon: <img alt="VNPay" className="h-6 w-6 object-contain" src={vnpayIcon} />,
    iconClassName: "bg-[#e8f1ff] text-[#0055a5]",
  },
];
