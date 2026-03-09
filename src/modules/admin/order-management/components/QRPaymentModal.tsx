import React, { useEffect, useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  orderNumber: string | number;
}

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  orderNumber,
}) => {
  const [paid, setPaid] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  const qrImageUrl = `https://img.vietqr.io/image/vietinbank-113366668888-compact.jpg?amount=${total}&addInfo=Order%20${orderNumber}`;

  useEffect(() => {
    if (!isOpen) {
      setPaid(false);
      setCountdown(300);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden">
        {/* Header */}
        <div className="bg-amber-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Payment QR Code</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {paid ? (
            /* Success state */
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <p className="text-xl font-bold text-gray-800">Payment Successful!</p>
              <p className="text-sm text-gray-500">Order #{orderNumber} has been paid</p>
              <button
                onClick={onClose}
                className="mt-2 w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Order info */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">Order</p>
                  <p className="font-bold text-gray-800">#{orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-medium">Amount</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {total.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="p-4 border-2 border-amber-100 rounded-xl bg-amber-50">
                  {countdown > 0 ? (
                    <img
                      src={qrImageUrl}
                      alt="VietQR Payment"
                      className="w-[200px] h-[200px] object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-gray-400 gap-2">
                      <p className="text-sm font-medium">QR Expired</p>
                      <button
                        onClick={() => setCountdown(300)}
                        className="text-xs text-amber-700 underline hover:text-amber-800"
                      >
                        Refresh
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Countdown */}
              {countdown > 0 && (
                <p className="text-center text-sm text-gray-500 mb-4">
                  QR expires in{' '}
                  <span className={`font-bold ${countdown <= 30 ? 'text-red-500' : 'text-amber-700'}`}>
                    {formatCountdown(countdown)}
                  </span>
                </p>
              )}

              <p className="text-center text-xs text-gray-400 mb-5">
                Scan with your banking app to complete payment
              </p>

              {/* Confirm button (simulate payment confirmation) */}
              <button
                onClick={() => setPaid(true)}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.99] shadow-lg shadow-amber-700/20"
              >
                Confirm Payment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRPaymentModal;
