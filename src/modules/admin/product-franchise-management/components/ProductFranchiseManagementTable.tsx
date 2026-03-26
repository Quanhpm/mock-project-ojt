import type { CSSProperties } from "react";
import { Eye, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import type { ProductFranchiseSearchItem } from "../types/product-franchise.types";
import ProductFranchiseStatusSwitch from "./ProductFranchiseStatusSwitch";

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;
if (!document.head.querySelector("style[data-product-franchise-table]")) {
  styleSheet.setAttribute("data-product-franchise-table", "true");
  document.head.appendChild(styleSheet);
}

interface ProductFranchiseManagementTableProps {
  items: ProductFranchiseSearchItem[];
  isLoading: boolean;
  isDeletedView: boolean;
  statusUpdatingId: string | null;
  actionsDisabled?: boolean;
  appliedKeyword: string;
  hasActiveFilters: boolean;
  onToggleStatus: (item: ProductFranchiseSearchItem) => void;
  onView: (item: ProductFranchiseSearchItem) => void;
  onEdit: (item: ProductFranchiseSearchItem) => void;
  onDelete: (item: ProductFranchiseSearchItem) => void;
  onRestore: (item: ProductFranchiseSearchItem) => void;
  onClearFilters: () => void;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const actionButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "transparent",
  color: "#94a3b8",
  cursor: "pointer",
  transition: "all 0.2s",
};

function ActionButton({
  label,
  icon,
  onClick,
  hoverBackground,
  hoverColor,
  disabled = false,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  hoverBackground: string;
  hoverColor: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...actionButtonStyle,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
      onMouseEnter={(event) => {
        if (disabled) {
          return;
        }

        event.currentTarget.style.backgroundColor = hoverBackground;
        event.currentTarget.style.color = hoverColor;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = "transparent";
        event.currentTarget.style.color = "#94a3b8";
      }}
      title={label}
    >
      {icon}
    </button>
  );
}

export default function ProductFranchiseManagementTable({
  items,
  isLoading,
  isDeletedView,
  statusUpdatingId,
  actionsDisabled = false,
  appliedKeyword,
  hasActiveFilters,
  onToggleStatus,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onClearFilters,
}: ProductFranchiseManagementTableProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex-1 overflow-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-[46%] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Product
              </th>
              <th className="w-[20%] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Price
              </th>
              <th className="w-[19%] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Status
              </th>
              <th className="w-[15%] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="border-t border-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-slate-50">
                  <td colSpan={4} className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-md bg-slate-200"
                        style={{ animation: "pulse 1.5s ease-in-out infinite" }}
                      />
                      <div className="flex-1">
                        <div
                          className="mb-2 h-4 w-3/5 rounded bg-slate-200"
                          style={{ animation: "pulse 1.5s ease-in-out infinite" }}
                        />
                        <div
                          className="h-3 w-2/5 rounded bg-slate-100"
                          style={{ animation: "pulse 1.5s ease-in-out infinite" }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-10 py-14 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                      <Search size={38} className="text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        No results found
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {appliedKeyword
                          ? `No product franchise match "${appliedKeyword}"`
                          : isDeletedView
                            ? "No deleted product franchises are available to display"
                            : "No product franchises are available to display"}
                      </p>
                    </div>
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={onClearFilters}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-sky-600 transition hover:border-sky-300 hover:bg-sky-50"
                      >
                        Clear Filters
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 transition hover:bg-slate-50"
                >
                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {item.product_name || item.product_id}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#8B4513]">
                        Size: {item.size || "--"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                    {formatPrice(item.price_base)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <ProductFranchiseStatusSwitch
                        checked={item.is_active}
                        isLoading={statusUpdatingId === item.id}
                        disabled={
                          actionsDisabled ||
                          isDeletedView ||
                          (statusUpdatingId !== null && statusUpdatingId !== item.id)
                        }
                        onChange={() => onToggleStatus(item)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <ActionButton
                        label="View Details"
                        icon={<Eye size={18} />}
                        onClick={() => onView(item)}
                        hoverBackground="rgba(51, 102, 204, 0.05)"
                        hoverColor="#3366cc"
                        disabled={actionsDisabled}
                      />
                      {isDeletedView ? (
                        <ActionButton
                          label="Restore"
                          icon={<RotateCcw size={18} />}
                          onClick={() => onRestore(item)}
                          hoverBackground="rgba(76, 175, 80, 0.05)"
                          hoverColor="#4caf50"
                          disabled={actionsDisabled}
                        />
                      ) : (
                        <>
                          <ActionButton
                            label="Edit"
                            icon={<Pencil size={18} />}
                            onClick={() => onEdit(item)}
                            hoverBackground="rgba(67, 56, 202, 0.08)"
                            hoverColor="#4338ca"
                            disabled={actionsDisabled}
                          />
                          <ActionButton
                            label="Delete"
                            icon={<Trash2 size={18} />}
                            onClick={() => onDelete(item)}
                            hoverBackground="#fee"
                            hoverColor="#ef4444"
                            disabled={actionsDisabled}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
