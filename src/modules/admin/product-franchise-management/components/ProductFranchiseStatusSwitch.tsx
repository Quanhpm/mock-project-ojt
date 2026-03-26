import { LoaderCircle } from "lucide-react";

interface ProductFranchiseStatusSwitchProps {
  checked: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onChange: () => void;
}

export default function ProductFranchiseStatusSwitch({
  checked,
  disabled = false,
  isLoading = false,
  onChange,
}: ProductFranchiseStatusSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled || isLoading}
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
          checked ? "bg-[#8B4513]" : "bg-slate-300"
        } ${(disabled || isLoading) ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        >
          {isLoading ? (
            <LoaderCircle size={12} className="animate-spin text-[#8B4513]" />
          ) : null}
        </span>
      </button>

      <span className="text-sm font-medium text-slate-600">
        {checked ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
