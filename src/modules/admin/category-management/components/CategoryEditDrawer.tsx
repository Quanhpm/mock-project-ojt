import { useState, useEffect } from "react";
import { X, Info, Settings, Save } from "lucide-react";
import { useGetCategory } from "./hooks/useGetCategory";
import { useUpdateCategory } from "./hooks/useUpdateCategory";
import { useToggleStatus } from "./hooks/useToggleStatus";

interface CategoryEditDrawerProps {
  categoryId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CategoryEditDrawer({
  categoryId,
  isOpen,
  onClose,
  onSuccess,
}: CategoryEditDrawerProps) {
  const { category, isLoading } = useGetCategory(categoryId);
  const { updateDisplayOrder, isUpdating } = useUpdateCategory();
  const { toggleStatus, isToggling } = useToggleStatus();

  const [displayOrder, setDisplayOrder] = useState<number | "">("");
  const [displayOrderError, setDisplayOrderError] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (category) {
      setDisplayOrder(category.display_order);
      setIsActive(category.is_active);
    }
  }, [category]);

  const handleDisplayOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setDisplayOrder("");
      setDisplayOrderError("Display order is required");
      return;
    }
    const val = Math.max(1, Math.floor(Number(raw)));
    setDisplayOrder(val);
    setDisplayOrderError(val < 1 ? "Display order must be at least 1" : "");
  };

  const handleSave = async () => {
    if (!category) return;
    if (displayOrder === "" || displayOrder < 1 || !Number.isInteger(displayOrder)) {
      setDisplayOrderError("Display order must be a positive whole number");
      return;
    }

    try {
      // Update display order
      if (displayOrder !== category.display_order) {
        await updateDisplayOrder(category.id, { display_order: displayOrder });
      }

      // Update status
      if (isActive !== category.is_active) {
        await toggleStatus(category.id, category.is_active);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      // Error already handled by hooks
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "580px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            backgroundColor: "white",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                backgroundColor: "#fdf3eb",
                padding: "10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Settings size={22} color="#8B4513" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#212529" }}>
                Edit Category
              </h2>
              {category && (
                <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                  {category.category_name} — {category.franchise_name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#6c757d",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
              Loading...
            </div>
          ) : !category ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#ef4444" }}>
              Category not found
            </div>
          ) : (
            <>
              {/* Category Details */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #f1f5f9",
                    marginBottom: "16px",
                  }}
                >
                  <Info size={16} color="#8B4513" />
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Category Details
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={category.category_name}
                      disabled
                      style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", backgroundColor: "#f8f9fa", color: "#6c757d", boxSizing: "border-box", cursor: "not-allowed" }}
                    />
                    <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                      Category cannot be changed after creation.
                    </span>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                      Franchise
                    </label>
                    <input
                      type="text"
                      value={category.franchise_name}
                      disabled
                      style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", backgroundColor: "#f8f9fa", color: "#6c757d", boxSizing: "border-box", cursor: "not-allowed" }}
                    />
                    <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                      Franchise assignment is fixed.
                    </span>
                  </div>
                </div>
              </div>

              {/* Settings & Display */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #f1f5f9",
                    marginBottom: "16px",
                  }}
                >
                  <Settings size={16} color="#8B4513" />
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Settings & Display
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={handleDisplayOrderChange}
                      onKeyDown={(e) => {
                        if (["-", "+", ".", "e", "E"].includes(e.key)) e.preventDefault();
                      }}
                      min="1"
                      step="1"
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        border: `1px solid ${displayOrderError ? "#ef4444" : "#d1d5db"}`,
                        borderRadius: "6px",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: "white",
                      }}
                    />
                    {displayOrderError ? (
                      <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{displayOrderError}</span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", display: "block" }}>Lower numbers appear first.</span>
                    )}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                      Status
                    </label>
                    <div style={{ height: "38px", display: "flex", alignItems: "center" }}>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8B5A2B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5A2B]"></div>
                        <span className="ml-3 text-sm font-medium text-slate-700">
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  display: "flex",
                  gap: "12px",
                  fontSize: "13px",
                  color: "#1e40af",
                }}
              >
                <Info size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "600" }}>Category Assignment</p>
                  <p style={{ margin: 0, color: "#1d4ed8" }}>
                    This category is assigned to <strong>{category.franchise_name}</strong>.
                    You can adjust the display order and status, but cannot change the category or franchise.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "20px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating || isToggling}
              style={{
                padding: "10px 20px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: isUpdating || isToggling ? "not-allowed" : "pointer",
                backgroundColor: "white",
                color: "#374151",
                marginRight: "auto",
                opacity: isUpdating || isToggling ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdating || isToggling || !category}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                backgroundColor: isUpdating || isToggling ? "#c4956a" : "#8B4513",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isUpdating || isToggling || !category ? "not-allowed" : "pointer",
              }}
            >
              <Save size={16} />
              {isUpdating || isToggling ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
