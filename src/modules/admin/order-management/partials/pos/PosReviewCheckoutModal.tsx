import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Loader2, MapPin, MessageSquare, Phone, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { checkoutInfoSchema, type CheckoutInfoFormValues } from "@/modules/client/cart/schemas/checkout.schema";

interface PosReviewCheckoutModalProps {
  open: boolean;
  initialValues: CheckoutInfoFormValues;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (values: CheckoutInfoFormValues) => Promise<boolean> | boolean;
}

export const PosReviewCheckoutModal = ({
  open,
  initialValues,
  isSubmitting = false,
  onClose,
  onConfirm,
}: PosReviewCheckoutModalProps) => {
  const { address, phone, message } = initialValues;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutInfoFormValues>({
    resolver: zodResolver(checkoutInfoSchema),
    mode: "onSubmit",
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({ address, phone, message });
  }, [address, message, open, phone, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose, open]);

  if (!open) {
    return null;
  }

  const submitCheckout = handleSubmit(async (values) => {
    const didCheckout = await onConfirm({
      address: values.address.trim(),
      phone: values.phone.trim(),
      message: values.message?.trim() ?? "",
    });

    if (didCheckout) {
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <div className="absolute inset-0" onClick={isSubmitting ? undefined : onClose} />

      <div className="relative w-full max-w-xl overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[28px]">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
        >
          <X size={20} />
        </button>

        <div className="border-b border-gray-100 px-5 pb-5 pt-6 sm:px-7">
          <div className="flex items-start gap-4 pr-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
              <CreditCard size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black tracking-tight text-gray-900">Thanh toán</h2>
            </div>
          </div>
        </div>

        <form
          className="space-y-5 px-5 py-5 sm:px-7 sm:py-6"
          onSubmit={(event) => {
            event.preventDefault();
            void submitCheckout();
          }}
        >
          <div className="space-y-3">
            <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-700" htmlFor="checkout-address">
              Địa chỉ giao hàng
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
                <MapPin size={18} />
              </div>
              <input
                disabled={isSubmitting}
                id="checkout-address"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-600/10"
                placeholder="Nhập địa chỉ giao hàng"
                type="text"
                {...register("address")}
              />
            </div>
            {errors.address?.message ? (
              <p className="text-xs text-red-600">{errors.address.message}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-700" htmlFor="checkout-phone">
              Số điện thoại
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
                <Phone size={18} />
              </div>
              <input
                disabled={isSubmitting}
                id="checkout-phone"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-600/10"
                placeholder="Nhập số điện thoại"
                type="text"
                {...register("phone")}
              />
            </div>
            {errors.phone?.message ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
          </div>

          <div className="space-y-3">
            <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-700" htmlFor="checkout-message">
              Lời nhắn cho cửa hàng
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-4 text-gray-400">
                <MessageSquare size={18} />
              </div>
              <textarea
                disabled={isSubmitting}
                id="checkout-message"
                className="min-h-[120px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-600/10"
                placeholder="Nhập lời nhắn"
                rows={4}
                {...register("message")}
              />
            </div>
            {errors.message?.message ? (
              <p className="text-xs text-red-600">{errors.message.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 w-full rounded-2xl bg-gray-100 px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 sm:w-auto"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-amber-800 px-5 text-sm font-black text-white shadow-lg shadow-amber-900/10 transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none sm:w-auto sm:min-w-[170px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Đang xử lý
                </>
              ) : (
                "Xác nhận checkout"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PosReviewCheckoutModal;
