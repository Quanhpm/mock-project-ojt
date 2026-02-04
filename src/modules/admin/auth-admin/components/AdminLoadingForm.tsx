type Props = {
  text?: string;
};

export const AdminLoadingForm: React.FC<Props> = ({ text = "Đang đăng nhập..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg px-8 py-6 flex flex-col items-center gap-4 shadow-xl">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-700">{text}</p>
      </div>
    </div>
  );
};
