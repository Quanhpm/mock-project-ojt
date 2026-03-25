interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  cancelLabel,
  confirmLabel,
  icon,
  iconBgClass,
  iconColorClass,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${iconBgClass}`}>
              <span className={`material-symbols-outlined text-[20px] ${iconColorClass}`}>{icon}</span>
            </span>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-[#6c4830] transition-colors shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
