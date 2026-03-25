import type { CSSProperties } from "react";
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

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
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
  actionLoadingKey: string | null;
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  border: "none",
  borderRadius: "6px",
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
  isLoading = false,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  hoverBackground: string;
  hoverColor: string;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        ...actionButtonStyle,
        cursor: disabled || isLoading ? "not-allowed" : "pointer",
        opacity: disabled || isLoading ? 0.55 : 1,
      }}
      onMouseEnter={(event) => {
        if (disabled || isLoading) {
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
      {isLoading ? (
        <svg
          className="animate-spin"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
          {icon}
        </span>
      )}
    </button>
  );
}

export default function ProductFranchiseManagementTable({
  items,
  isLoading,
  isDeletedView,
  statusUpdatingId,
  actionLoadingKey,
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
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #e9ecef",
        overflow: "hidden",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            tableLayout: "fixed",
            textAlign: "left",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              <th
                style={{
                  width: "46%",
                  padding: "12px 16px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#6c757d",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Product
              </th>
              <th
                style={{
                  width: "20%",
                  padding: "12px 16px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#6c757d",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Price
              </th>
              <th
                style={{
                  width: "19%",
                  padding: "12px 16px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#6c757d",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  textAlign: "center",
                }}
              >
                Status
              </th>
              <th
                style={{
                  width: "15%",
                  padding: "12px 16px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#6c757d",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  textAlign: "center",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ borderTop: "1px solid #e9ecef" }}>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #f8f9fa" }}>
                  <td colSpan={4} style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "6px",
                          backgroundColor: "#e0e0e0",
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            height: "16px",
                            backgroundColor: "#e0e0e0",
                            borderRadius: "4px",
                            marginBottom: "8px",
                            width: "60%",
                            animation: "pulse 1.5s ease-in-out infinite",
                          }}
                        />
                        <div
                          style={{
                            height: "12px",
                            backgroundColor: "#f0f0f0",
                            borderRadius: "4px",
                            width: "40%",
                            animation: "pulse 1.5s ease-in-out infinite",
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "60px 40px", textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#212529",
                          margin: "0 0 8px 0",
                        }}
                      >
                        No results found
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6c757d",
                          margin: 0,
                        }}
                      >
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
                        style={{
                          marginTop: "8px",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "1px solid #e0e0e0",
                          backgroundColor: "white",
                          color: "#3b82f6",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.backgroundColor = "#eff6ff";
                          event.currentTarget.style.borderColor = "#3b82f6";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.backgroundColor = "white";
                          event.currentTarget.style.borderColor = "#e0e0e0";
                        }}
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
                  style={{
                    transition: "background-color 0.2s",
                    borderBottom: "1px solid #f8f9fa",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <td style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#212529",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.product_name || item.product_id}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#8B4513",
                          fontWeight: "600",
                        }}
                      >
                        Size: {item.size || "--"}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#212529",
                    }}
                  >
                    {formatPrice(item.price_base)}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
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
                  <td style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <ActionButton
                        label="View Details"
                        icon="visibility"
                        onClick={() => onView(item)}
                        hoverBackground="rgba(51, 102, 204, 0.05)"
                        hoverColor="#3366cc"
                        disabled={actionsDisabled}
                        isLoading={actionLoadingKey === `view:${item.id}`}
                      />
                      {isDeletedView ? (
                        <ActionButton
                          label="Restore"
                          icon="restore"
                          onClick={() => onRestore(item)}
                          hoverBackground="rgba(76, 175, 80, 0.05)"
                          hoverColor="#4caf50"
                          disabled={actionsDisabled}
                        />
                      ) : (
                        <>
                          <ActionButton
                            label="Edit"
                            icon="edit"
                            onClick={() => onEdit(item)}
                            hoverBackground="rgba(67, 56, 202, 0.08)"
                            hoverColor="#4338ca"
                            disabled={actionsDisabled}
                            isLoading={actionLoadingKey === `edit:${item.id}`}
                          />
                          <ActionButton
                            label="Delete"
                            icon="delete"
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











