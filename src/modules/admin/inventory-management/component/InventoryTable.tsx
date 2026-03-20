import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetInventories } from "./hooks/useGetInventories";
import { useBulkAdjustInventory } from "./hooks/useBulkAdjustInventory";
import {
  getInventoryTableFieldPath,
  inventoryTableFormSchema,
} from "./inventory-table.validation";
import type {
  InventorySearchPayload,
  InventoryTableRow,
  BulkAdjustPayload,
} from "./inventory.types";
import { useToast } from "@/hooks/use-toast.hook";

const getStockStatus = (quantity: number, alertThreshold: number) => {
  if (quantity <= 0) return { label: "Out of Stock", color: "#dc3545", bg: "#f8d7da" };
  if (quantity <= alertThreshold) return { label: "Low Stock", color: "#b26a00", bg: "#fff3cd" };
  return { label: "In Stock", color: "#1f7a38", bg: "#d4edda" };
};

type InventoryTableFormValues = { items: InventoryTableRow[] };
type FilterFormValues = {
  keywordInput: string;
  status: "" | "true" | "false";
  franchiseId: string;
};

export default function InventoryTable() {
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const itemsPerPage = 10;

  const {
    inventories,
    isLoading,
    totalItems,
    totalPages,
    refetch,
  } = useGetInventories(true);
  const { bulkAdjust, isAdjusting: isBulkAdjusting } = useBulkAdjustInventory();

  const filterForm = useForm<FilterFormValues>({
    defaultValues: {
      keywordInput: "",
      status: "",
      franchiseId: "",
    },
  });

  const tableForm = useForm<InventoryTableFormValues>({
    defaultValues: { items: [] },
    resolver: zodResolver(inventoryTableFormSchema) as never,
    mode: "onSubmit",
  });

  const {
    control,
    register,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = tableForm;

  const { fields, replace, update } = useFieldArray({
    control,
    name: "items",
  });

  const statusFilter = filterForm.watch("status");
  const franchiseFilter = filterForm.watch("franchiseId");
  const watchedItems = watch("items");

  const buildPayload = (): InventorySearchPayload => ({
    searchCondition: {
      keyword: searchKeyword.trim() || undefined,
      is_active: statusFilter === "" ? undefined : statusFilter === "true",
      franchise_id: franchiseFilter || undefined,
      is_deleted: showDeleted,
    },
    pageInfo: { pageNum: currentPage, pageSize: itemsPerPage },
  });

  useEffect(() => {
    void refetch(buildPayload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showDeleted, statusFilter, franchiseFilter, searchKeyword]);

  useEffect(() => {
    replace(
      inventories.map((item) => ({
        ...item,
        _selected: false,
        _editQuantity: item.quantity,
        _editAlertThreshold: item.alert_threshold,
        _originalQuantity: item.quantity,
        _originalAlertThreshold: item.alert_threshold,
      })),
    );
  }, [inventories, replace]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const selectedCount = watchedItems?.filter((row) => row._selected).length ?? 0;

  const franchiseOptions = useMemo(
    () =>
      Array.from(
        new Map(inventories.map((item) => [item.franchise_id, item.franchise_name ?? item.franchise_id])).entries(),
      ).sort((a, b) => a[1].localeCompare(b[1])),
    [inventories],
  );

  const handleSearch = filterForm.handleSubmit((values) => {
    setCurrentPage(1);
    setSearchKeyword(values.keywordInput.trim());
  });

  const handleClearFilters = () => {
    filterForm.reset({ keywordInput: "", status: "", franchiseId: "" });
    setSearchKeyword("");
    setShowDeleted(false);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    const items = getValues("items");
    replace(items.map((item) => ({ ...item, _selected: checked })));
  };

  const handleToggleRow = (index: number) => {
    const row = getValues(`items.${index}`);
    update(index, { ...row, _selected: !row._selected });
  };

  const handleUpdateSelected = async () => {
    const currentItems = getValues("items");
    const selectedIndexes = currentItems
      .map((item, index) => (item._selected ? index : -1))
      .filter((index) => index >= 0);

    if (selectedIndexes.length === 0) {
      toastError("Error", "Please select at least one row to update.");
      return;
    }

    const validationPaths = selectedIndexes.flatMap((index) => [
      getInventoryTableFieldPath(index, "_editQuantity"),
      getInventoryTableFieldPath(index, "_editAlertThreshold"),
    ]);

    const isValid = await trigger(validationPaths as never);
    if (!isValid) {
      toastError("Validation failed", "Please fix invalid values before updating.");
      return;
    }

    const selectedRows = selectedIndexes.map((index) => currentItems[index]);
    const payload: BulkAdjustPayload = {
      items: selectedRows.map((row) => ({
        product_franchise_id: row.product_franchise_id,
        change: row._editQuantity - row._originalQuantity,
        alert_threshold: row._editAlertThreshold,
        reason: "Manual inventory table update",
      })),
    };

    await bulkAdjust(payload, async () => {
      await refetch(buildPayload());
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header
          style={{
            width: "100%",
            padding: "24px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            flexShrink: 0,
          }}
        >
          <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#6c757d" }}>
            <a href="#" style={{ color: "#6c757d", textDecoration: "none" }}>Home</a>
            <span style={{ fontSize: "16px" }}>›</span>
            <span style={{ color: "#212529", fontWeight: "500" }}>Inventory</span>
          </nav>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.025em", color: "#212529", margin: 0 }}>
                Inventory Management
              </h2>
              <p style={{ color: "#6c757d", margin: 0 }}>Total items: {totalItems}</p>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleUpdateSelected}
                disabled={selectedCount === 0 || isBulkAdjusting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#8B4513",
                  color: "white",
                  fontWeight: 600,
                  cursor: selectedCount === 0 || isBulkAdjusting ? "not-allowed" : "pointer",
                  opacity: selectedCount === 0 || isBulkAdjusting ? 0.7 : 1,
                }}
              >
                {isBulkAdjusting ? "Updating..." : `Update Selected (${selectedCount})`}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/inventory/create")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#8B4513",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Add Inventory
              </button>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "0 32px 32px", gap: "16px", minHeight: 0 }}>
          <form
            onSubmit={handleSearch}
            style={{ backgroundColor: "white", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", flexShrink: 0 }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, position: "relative", minWidth: "260px" }}>
                <div style={{ position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", color: "#6c757d" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  {...filterForm.register("keywordInput")}
                  placeholder="Search by product name... (Ctrl+K)"
                  style={{ width: "100%", borderRadius: "8px", border: "1px solid #e9ecef", padding: "10px 12px 10px 38px", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#8B4513", color: "white", padding: "10px 18px", borderRadius: "8px", border: "none", fontWeight: 600, fontSize: "14px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? "Searching..." : "Search"}
              </button>

              <select
                {...filterForm.register("status")}
                style={{ borderRadius: "8px", border: "1px solid #e9ecef", padding: "10px 12px", fontSize: "14px", minWidth: "160px" }}
              >
                <option value="">All status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <select
                {...filterForm.register("franchiseId")}
                style={{ borderRadius: "8px", border: "1px solid #e9ecef", padding: "10px 12px", fontSize: "14px", minWidth: "180px" }}
              >
                <option value="">All franchise</option>
                {franchiseOptions.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setShowDeleted((prev) => !prev);
                  setCurrentPage(1);
                }}
                disabled={isLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${showDeleted ? "#dc3545" : "#28a745"}`,
                  backgroundColor: showDeleted ? "#fff5f5" : "#f0fff4",
                  color: showDeleted ? "#dc3545" : "#1f7a38",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {showDeleted ? "Deleted" : "Available"}
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                disabled={isLoading}
                style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #e9ecef", background: "white", color: "#8B4513", fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer" }}
              >
                Clear Filters
              </button>
            </div>
          </form>

          {isLoading ? (
            <div style={{ backgroundColor: "white", padding: "48px 20px", borderRadius: "12px", border: "1px solid #e9ecef", textAlign: "center" }}>
              <p style={{ color: "#6c757d", fontSize: "15px", margin: 0 }}>Loading inventory...</p>
            </div>
          ) : fields.length === 0 ? (
            <div style={{ backgroundColor: "white", padding: "60px 20px", borderRadius: "12px", border: "1px solid #e9ecef", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 600, color: "#212529" }}>No Inventory Items</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>No inventory data found for the current filters.</p>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e9ecef", overflow: "hidden", minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                      <th style={{ padding: "12px 16px", width: "40px" }}>
                        <input
                          type="checkbox"
                          checked={fields.length > 0 && watchedItems?.every((item) => item?._selected)}
                          onChange={(event) => handleSelectAll(event.target.checked)}
                          style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#8B4513" }}
                        />
                      </th>
                      {[
                        "Product",
                        "Franchise",
                        "Quantity",
                        "Alert Threshold",
                        "Stock Status",
                        "Actions",
                      ].map((header) => (
                        <th key={header} style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: header === "Actions" ? "center" : "left" }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => {
                      const item = watchedItems?.[index];
                      if (!item) return null;
                      const stockStatus = getStockStatus(item._editQuantity, item._editAlertThreshold);
                      const quantityPath = getInventoryTableFieldPath(index, "_editQuantity");
                      const thresholdPath = getInventoryTableFieldPath(index, "_editAlertThreshold");

                      return (
                        <tr key={field.id} style={{ borderBottom: "1px solid #eef0f2", backgroundColor: item._selected ? "#fff8f2" : "transparent" }}>
                          <td style={{ padding: "16px" }}>
                            <input
                              type="checkbox"
                              checked={item._selected}
                              onChange={() => handleToggleRow(index)}
                              style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#8B4513" }}
                            />
                          </td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "#212529", fontWeight: 600 }}>
                            {item.product_name ?? item.product_id}
                          </td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "#495057" }}>
                            {item.franchise_name ?? item.franchise_id}
                          </td>
                          <td style={{ padding: "16px" }}>
                            <input
                              type="number"
                              min={0}
                              {...register(quantityPath, { valueAsNumber: true })}
                              style={{ width: "88px", padding: "7px 8px", borderRadius: "6px", border: errors.items?.[index]?._editQuantity ? "1px solid #dc2626" : "1px solid #dee2e6", fontSize: "14px", textAlign: "center" }}
                            />
                          </td>
                          <td style={{ padding: "16px" }}>
                            <input
                              type="number"
                              min={0}
                              {...register(thresholdPath, { valueAsNumber: true })}
                              style={{ width: "88px", padding: "7px 8px", borderRadius: "6px", border: errors.items?.[index]?._editAlertThreshold ? "1px solid #dc2626" : "1px solid #dee2e6", fontSize: "14px", textAlign: "center" }}
                            />
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "12px", color: stockStatus.color, backgroundColor: stockStatus.bg }}>
                              {stockStatus.label}
                            </span>
                          </td>
                          <td style={{ padding: "16px", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/inventory/edit/${item.id}`)}
                              style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #8B4513", backgroundColor: "#8B4513", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e9ecef", backgroundColor: "#f8f9fa", padding: "12px 24px" }}>
                <p style={{ fontSize: "14px", color: "#495057", margin: 0 }}>
                  Page {currentPage} of {Math.max(1, totalPages)} ({totalItems} total items)
                </p>

                <nav style={{ display: "inline-flex" }}>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading}
                    style={{ padding: "8px 14px", border: "1px solid #dee2e6", borderRight: "none", borderRadius: "6px 0 0 6px", background: "white", cursor: currentPage === 1 || isLoading ? "not-allowed" : "pointer", color: currentPage === 1 || isLoading ? "#adb5bd" : "#495057" }}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      disabled={isLoading}
                      style={{ padding: "8px 12px", border: "1px solid #dee2e6", borderRight: "none", background: page === currentPage ? "#8B4513" : "white", color: page === currentPage ? "white" : "#495057", cursor: isLoading ? "not-allowed" : "pointer" }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(Math.max(1, totalPages), prev + 1))}
                    disabled={currentPage >= totalPages || totalPages === 0 || isLoading}
                    style={{ padding: "8px 14px", border: "1px solid #dee2e6", borderRadius: "0 6px 6px 0", background: "white", cursor: currentPage >= totalPages || totalPages === 0 || isLoading ? "not-allowed" : "pointer", color: currentPage >= totalPages || totalPages === 0 || isLoading ? "#adb5bd" : "#495057" }}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}