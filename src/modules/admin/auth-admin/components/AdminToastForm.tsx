import { useEffect } from "react";

type Props = {
  message: string;
  visible: boolean;
  onClose?: () => void;
  duration?: number;
  type?: "success" | "error";
};

export const AdminToastForm: React.FC<Props> = ({
  message,
  visible,
  onClose,
  duration = 2000,
  type = "success",
}) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div className={`fixed top-6 right-6 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg`}>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
