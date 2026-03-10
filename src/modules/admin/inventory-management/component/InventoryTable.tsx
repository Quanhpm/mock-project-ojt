import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { useGetInventories } from "./hooks/useGetInventories";
import { useDeleteInventory } from "./hooks/useDeleteInventory";
import { useRestoreInventory } from "./hooks/useRestoreInventory";
import { useAdjustInventory } from "./hooks/useAdjustInventory";
import { useGetInventoryLogs } from "./hooks/useGetInventoryLogs";
import { useBulkAdjustInventory } from "./hooks/useBulkAdjustInventory";
import { useInventoryExcel } from "./hooks/useInventoryExcel";
import type { InventoryItem, InventorySearchPayload, InventoryTableRow, BulkAdjustPayload } from "./inventory.types";
import InventoryDelete from "./InventoryDelete";
import { useToast } from "@/hooks/use-toast.hook";

const getStockStatus = (quantity: number, alertThreshold: number) => {
  if (quantity === 0) return { label: "Out of Stock", color: "#dc3545" };
  if (quantity <= alertThreshold) return { label: "Low Stock", color: "#ffc107" };
  return { label: "In Stock", color: "#28a745" };
};

export default function InventoryTable() {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  // === Existing state ===
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; inventoryId: string; productName: string }>({ isOpen: false, inventoryId: "", productName: "" });
  const [adjustPopover, setAdjustPopover] = useState<{ open: boolean; item: InventoryItem | null }>({ open: false, item: null });
  const [popoverIncrease, setPopoverIncrease] = useState("");
  const [popoverDecrease, setPopoverDecrease] = useState("");
  const [popoverReason, setPopoverReason] = useState("");
  const [logsModal, setLogsModal] = useState<{ open: boolean; inventoryId: string; productName: string }>({ open: false, inventoryId: "", productName: "" });
  const [restoreModal, setRestoreModal] = useState<{ open: boolean; inventoryId: string; productName: string }>({ open: false, inventoryId: "", productName: "" });
  const [inputValue, setInputValue] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 7;

  // === Data hooks ===
  const { inventories, isLoading, totalItems, totalPages, refetch } = useGetInventories();
  const { deleteInventory, isDeleting } = useDeleteInventory();
  const { restoreInventory, isRestoring } = useRestoreInventory();
  const { adjustInventory, isAdjusting } = useAdjustInventory();
  const { logs, isLoading: isLogsLoading, fetchLogs } = useGetInventoryLogs();
  const { bulkAdjust, isAdjusting: isBulkAdjusting } = useBulkAdjustInventory();

  // === React Hook Form + useFieldArray ===
  const methods = useForm<{ items: InventoryTableRow[] }>({ defaultValues: { items: [] } });
  const { control, register, getValues, watch } = methods;
  const { fields, replace, update } = useFieldArray({ control, name: "items" });

  // === Excel hook ===
  const {
    handleExportAll, handleExportSelected,
    fileInputRef, handleImportClick, handleFileChange,
    isParsingFile, importErrors, setImportErrors,
  } = useInventoryExcel({ getValues, replace });

  // === Sync API data → RHF form ===
  useEffect(() => {
    if (inventories.length > 0) {
      replace(
        inventories.map((item) => ({
          ...item,
          _selected: false,
          _editQuantity: item.quantity,
          _editAlertThreshold: item.alert_threshold,
          _originalQuantity: item.quantity,
          _originalAlertThreshold: item.alert_threshold,
        }))
      );
    } else {
      replace([]);
    }
  }, [inventories, replace]);

  const buildPayload = (page: number): InventorySearchPayload => ({
    searchCondition: { is_deleted: showDeleted },
    pageInfo: { pageNum: page, pageSize: itemsPerPage },
  });

  useEffect(() => { refetch(buildPayload(currentPage)); }, [currentPage, showDeleted]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); searchInputRef.current?.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // === Watched values for selected count ===
  const watchedItems = watch("items");
  const selectedCount = watchedItems?.filter((r) => r._selected).length ?? 0;

  // === Dirty check: có row nào đang bị edit chưa lưu không ===
  const hasDirtyRows = watchedItems?.some(
    (r) => r._editQuantity !== r._originalQuantity || r._editAlertThreshold !== r._originalAlertThreshold
  ) ?? false;

  // === Safe page change: cảnh báo nếu có edit chưa lưu ===
  const handlePageChange = useCallback((newPage: number) => {
    if (hasDirtyRows) {
      const confirmed = window.confirm(
        "Bạn có thay đổi chưa được lưu. Nếu chuyển trang, các thay đổi sẽ bị mất.\n\nBạn có muốn tiếp tục không?"
      );
      if (!confirmed) return;
    }
    setCurrentPage(newPage);
  }, [hasDirtyRows]);

  // === Client-side filter ===
  const filteredFields = fields.filter((_field, index) => {
    const item = watchedItems?.[index];
    if (!item) return false;
    const productName = item.product_name ?? "";
    const matchesSearch = searchTerm === "" || productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFranchise = franchiseFilter === "" || (item.franchise_name ?? item.franchise_id) === franchiseFilter;
    const stockStatus = getStockStatus(item._editQuantity, item._editAlertThreshold);
    const matchesStatus = statusFilter === "all"
      || (statusFilter === "in-stock" && stockStatus.label === "In Stock")
      || (statusFilter === "low-stock" && stockStatus.label === "Low Stock")
      || (statusFilter === "out-of-stock" && stockStatus.label === "Out of Stock");
    return matchesSearch && matchesStatus && matchesFranchise;
  });

  const franchiseOptions = Array.from(
    new Map(inventories.map(i => [i.franchise_id, i.franchise_name ?? i.franchise_id])).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  // === Handlers ===
  const handleClearFilters = () => { setInputValue(""); setSearchTerm(""); setStatusFilter("all"); setFranchiseFilter(""); setShowDeleted(false); setCurrentPage(1); };
  const handleSearch = () => { setSearchTerm(inputValue); setCurrentPage(1); };

  const handleSelectAll = useCallback((checked: boolean) => {
    const items = getValues("items");
    // Chỉ tick/untick các row ĐANG HIỂN THỊ (sau filter), không ảnh hưởng rows ẩn
    const visibleIds = new Set(filteredFields.map(f => f.id));
    replace(items.map((item, i) => {
      const fieldId = fields[i]?.id;
      if (visibleIds.has(fieldId)) return { ...item, _selected: checked };
      return item; // Giữ nguyên state của rows đang bị filter ẩn
    }));
  }, [getValues, replace, filteredFields, fields]);

  const handleToggleRow = useCallback((index: number) => {
    const item = getValues(`items.${index}`);
    update(index, { ...item, _selected: !item._selected });
  }, [getValues, update]);

  // === Update Selected → API ===
  const handleUpdateSelected = useCallback(() => {
    const currentItems = getValues("items");
    const selectedRows = currentItems.filter(r => r._selected);

    if (selectedRows.length === 0) {
      toastError("Lỗi", "Vui lòng chọn ít nhất 1 row để update");
      return;
    }

    // === NaN Guard + Validation trước khi gọi API ===
    const invalidRows: string[] = [];
    selectedRows.forEach((row, i) => {
      const qty = row._editQuantity;
      const threshold = row._editAlertThreshold;
      const label = row.product_name ?? row.product_id ?? `Row ${i + 1}`;

      if (isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
        invalidRows.push(`"${label}": quantity không hợp lệ (${isNaN(qty) ? "trống/NaN" : qty < 0 ? "âm" : "không phải số nguyên"})`);
      }
      if (isNaN(threshold) || threshold < 0 || !Number.isInteger(threshold)) {
        invalidRows.push(`"${label}": alert_threshold không hợp lệ (${isNaN(threshold) ? "trống/NaN" : threshold < 0 ? "âm" : "không phải số nguyên"})`);
      }
    });

    if (invalidRows.length > 0) {
      toastError("Dữ liệu không hợp lệ", invalidRows.join(" | "));
      return;
    }

    const payload: BulkAdjustPayload = {
      items: selectedRows.map(row => ({
        product_franchise_id: row.product_franchise_id,
        change: row._editQuantity - row._originalQuantity,
        alert_threshold: row._editAlertThreshold,
        reason: "",
      })),
    };

    bulkAdjust(payload, () => {
      refetch(buildPayload(currentPage));
    });
  }, [getValues, bulkAdjust, refetch, currentPage, toastError]);

  // === Legacy handlers (adjust, logs, delete, restore) ===
  const handleOpenAdjust = (_e: React.MouseEvent<HTMLButtonElement>, item: InventoryItem) => {
    setAdjustPopover({ open: true, item }); setPopoverIncrease(""); setPopoverDecrease(""); setPopoverReason("");
  };
  const handleAdjustSubmit = () => {
    if (!adjustPopover.item) return;
    const change = (Number(popoverIncrease) || 0) - (Number(popoverDecrease) || 0);
    if (change === 0) return;
    adjustInventory({ product_franchise_id: adjustPopover.item.product_franchise_id, change, reason: popoverReason.trim() || "Điều chỉnh số lượng" }, () => {
      setAdjustPopover({ open: false, item: null }); refetch(buildPayload(currentPage));
    });
  };
  const handleViewLogs = (inventoryId: string, productName: string) => { setLogsModal({ open: true, inventoryId, productName }); fetchLogs(inventoryId); };
  const handleDelete = (inventoryId: string, productName: string) => { setDeleteModal({ isOpen: true, inventoryId, productName }); };
  const handleDeleteConfirm = () => { deleteInventory(deleteModal.inventoryId, () => { setDeleteModal({ isOpen: false, inventoryId: "", productName: "" }); refetch(buildPayload(currentPage)); }); };
  const handleRestore = (inventoryId: string, productName: string) => { setRestoreModal({ open: true, inventoryId, productName }); };
  const handleRestoreConfirm = () => { restoreInventory(restoreModal.inventoryId, () => { setRestoreModal({ open: false, inventoryId: "", productName: "" }); refetch(buildPayload(currentPage)); }); };

  // === Styles ===
  const btnOutline: React.CSSProperties = { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid #8B4513", backgroundColor: "white", color: "#8B4513", fontWeight: "600", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" };
  const btnPrimary: React.CSSProperties = { ...btnOutline, backgroundColor: "#8B4513", color: "white", border: "none" };
  const editInputStyle: React.CSSProperties = { width: "80px", padding: "6px 8px", borderRadius: "6px", border: "1px solid #dee2e6", fontSize: "14px", textAlign: "center", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
        {/* Header */}
        <header style={{ width: "100%", padding: "24px 32px", display: "flex", flexDirection: "column", gap: "24px", flexShrink: 0, zIndex: 10 }}>
          <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#6c757d" }}>
            <a href="#" style={{ color: "#6c757d", textDecoration: "none" }}>Home</a>
            <span style={{ fontSize: "16px" }}>›</span>
            <span style={{ color: "#212529", fontWeight: "500" }}>Inventory</span>
          </nav>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h2 style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-0.025em", color: "#212529", margin: 0 }}>Inventory Management</h2>
              <p style={{ color: "#6c757d", margin: 0 }}>Total Items: {totalItems}</p>
            </div>
            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={handleExportAll} style={btnOutline}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f8f0e8"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>download</span>Export All
              </button>
              <button onClick={handleExportSelected} disabled={selectedCount === 0}
                style={{ ...btnOutline, opacity: selectedCount === 0 ? 0.5 : 1, cursor: selectedCount === 0 ? "not-allowed" : "pointer" }}
                onMouseEnter={e => { if (selectedCount > 0) e.currentTarget.style.backgroundColor = "#f8f0e8"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>download</span>Export Selected
              </button>
              <button onClick={handleImportClick} disabled={isParsingFile} style={btnOutline}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f8f0e8"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>upload</span>{isParsingFile ? "Đang xử lý..." : "Import"}
              </button>
              <input type="file" accept=".xlsx,.xls,.csv" hidden ref={fileInputRef} onChange={handleFileChange} />
              <button onClick={handleUpdateSelected} disabled={selectedCount === 0 || isBulkAdjusting}
                style={{ ...btnPrimary, opacity: (selectedCount === 0 || isBulkAdjusting) ? 0.5 : 1, cursor: (selectedCount === 0 || isBulkAdjusting) ? "not-allowed" : "pointer" }}
                onMouseEnter={e => { if (selectedCount > 0 && !isBulkAdjusting) e.currentTarget.style.backgroundColor = "#6d3610"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#8B4513"; }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>sync</span>
                {isBulkAdjusting ? "Đang cập nhật..." : `Update Selected (${selectedCount})`}
              </button>
              <button onClick={() => navigate('/admin/inventory/create')}
                style={{ ...btnPrimary }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#6d3610"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#8B4513"}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>Add Inventory
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "0 32px 32px", gap: "16px", minHeight: 0 }}>
          {/* Filters */}
          <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", flexShrink: 0, zIndex: 20 }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", pointerEvents: "none", color: "#6c757d" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                </div>
                <input ref={searchInputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
                  placeholder="Tìm kiếm theo tên sản phẩm... (Ctrl+k)"
                  style={{ display: "block", width: "100%", borderRadius: "8px", border: "0", padding: "10px 16px 10px 40px", color: "#212529", backgroundColor: "#f8f9fa", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
              </div>
              <button onClick={handleSearch} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#8B4513", color: "white", padding: "10px 18px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#6d3610"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#8B4513"}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>Tìm kiếm
              </button>
              <div style={{ position: "relative", minWidth: "165px" }}>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ display: "block", width: "100%", appearance: "none", borderRadius: "8px", border: "0", padding: "10px 40px 10px 12px", color: "#212529", backgroundColor: "#f8f9fa", outline: "none", fontSize: "14px", cursor: "pointer", boxSizing: "border-box" }}>
                  <option value="all">Tất cả trạng thái</option><option value="in-stock">In Stock</option><option value="low-stock">Low Stock</option><option value="out-of-stock">Out of Stock</option>
                </select>
                <div style={{ pointerEvents: "none", position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", color: "#6c757d" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              <div style={{ position: "relative", minWidth: "175px" }}>
                <select value={franchiseFilter} onChange={e => { setFranchiseFilter(e.target.value); setCurrentPage(1); }} style={{ display: "block", width: "100%", appearance: "none", borderRadius: "8px", border: "0", padding: "10px 40px 10px 12px", color: "#212529", backgroundColor: "#f8f9fa", outline: "none", fontSize: "14px", cursor: "pointer", boxSizing: "border-box" }}>
                  <option value="">Sort by Franchise</option>
                  {franchiseOptions.map(([id, name]) => (<option key={id} value={name}>{name}</option>))}
                </select>
                <div style={{ pointerEvents: "none", position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", color: "#6c757d" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              <button onClick={() => { setShowDeleted(d => !d); setCurrentPage(1); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "8px", border: showDeleted ? "1px solid #dc3545" : "1px solid #e0e0e0", fontWeight: "500", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap", backgroundColor: showDeleted ? "#fff5f5" : "white", color: showDeleted ? "#dc3545" : "#374151", transition: "all 0.2s" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>{showDeleted ? "Đã xóa" : "Hiện tại"}
              </button>
              <button onClick={handleClearFilters} style={{ fontSize: "14px", fontWeight: "500", color: "#8B4513", padding: "10px 8px", whiteSpace: "nowrap", cursor: "pointer", border: "none", backgroundColor: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.color = "#6d3610"} onMouseLeave={e => e.currentTarget.style.color = "#8B4513"}>
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Error Banner (Import Validation Errors) */}
          {importErrors.length > 0 && (
            <div style={{ backgroundColor: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", padding: "16px", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4 style={{ margin: 0, color: "#c53030", fontSize: "14px", fontWeight: "700" }}>⚠️ Import Errors ({importErrors.length} lỗi):</h4>
                <button onClick={() => setImportErrors([])} style={{ background: "none", border: "none", cursor: "pointer", color: "#c53030", fontSize: "18px", lineHeight: 1, padding: "0 4px" }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {importErrors.map((err, i) => (
                  <p key={i} style={{ margin: 0, fontSize: "13px", color: "#c53030", lineHeight: "1.5" }}>{err.message}</p>
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          {isLoading ? (
            <div style={{ backgroundColor: "white", padding: "60px 20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", textAlign: "center", flexShrink: 0 }}>
              <p style={{ color: "#6c757d", fontSize: "16px" }}>Loading...</p>
            </div>
          ) : filteredFields.length > 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", overflow: "hidden", minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                      <th style={{ padding: "12px 16px", width: "40px" }}>
                        <input type="checkbox"
                          checked={filteredFields.length > 0 && filteredFields.every(f => {
                            const idx = fields.findIndex(ff => ff.id === f.id);
                            return watchedItems?.[idx]?._selected === true;
                          })}
                          onChange={e => handleSelectAll(e.target.checked)}
                          style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#8B4513" }} />
                      </th>
                      {["ID", "Product", "Franchise", "Quantity", "Alert Threshold", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: h === "Actions" ? "center" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: "1px solid #e9ecef" }}>
                    {filteredFields.map((field) => {
                      const index = fields.findIndex(f => f.id === field.id);
                      const item = watchedItems?.[index];
                      if (!item) return null;
                      const stockStatus = getStockStatus(item._editQuantity, item._editAlertThreshold);
                      return (
                        <tr key={field.id} style={{ borderBottom: "1px solid #e9ecef", backgroundColor: item._selected ? "#fff8f2" : "transparent", transition: "background-color 0.15s" }}
                          onMouseEnter={e => { if (!item._selected) e.currentTarget.style.backgroundColor = "#f8f9fa"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = item._selected ? "#fff8f2" : "transparent"; }}>
                          <td style={{ padding: "16px" }}>
                            <input type="checkbox" checked={item._selected} onChange={() => handleToggleRow(index)}
                              style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#8B4513" }} />
                          </td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "#495057" }}>#{item.id.slice(-6)}</td>
                          <td style={{ padding: "16px" }}><span style={{ fontSize: "14px", fontWeight: "600", color: "#212529" }}>{item.product_name ?? item.product_id}</span></td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "#495057" }}>{item.franchise_name ?? item.franchise_id}</td>
                          <td style={{ padding: "16px" }}>
                            <input type="number" min={0} {...register(`items.${index}._editQuantity` as const, { valueAsNumber: true })}
                              style={{ ...editInputStyle, borderColor: item._editQuantity !== item._originalQuantity ? "#8B4513" : "#dee2e6", fontWeight: item._editQuantity !== item._originalQuantity ? "700" : "400" }}
                              onFocus={e => e.currentTarget.style.borderColor = "#8B4513"} onBlur={e => { if (item._editQuantity === item._originalQuantity) e.currentTarget.style.borderColor = "#dee2e6"; }} />
                          </td>
                          <td style={{ padding: "16px" }}>
                            <input type="number" min={0} {...register(`items.${index}._editAlertThreshold` as const, { valueAsNumber: true })}
                              style={{ ...editInputStyle, borderColor: item._editAlertThreshold !== item._originalAlertThreshold ? "#8B4513" : "#dee2e6", fontWeight: item._editAlertThreshold !== item._originalAlertThreshold ? "700" : "400" }}
                              onFocus={e => e.currentTarget.style.borderColor = "#8B4513"} onBlur={e => { if (item._editAlertThreshold === item._originalAlertThreshold) e.currentTarget.style.borderColor = "#dee2e6"; }} />
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "12px", backgroundColor: stockStatus.label === "In Stock" ? "#d4edda" : stockStatus.label === "Low Stock" ? "#fff3cd" : "#f8d7da", color: stockStatus.color }}>{stockStatus.label}</span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                              {showDeleted ? (
                                <button title="Khôi phục" onClick={() => handleRestore(item.id, item.product_name ?? item.product_id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" }}
                                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#e8f5e9"; e.currentTarget.style.color = "#28a745"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>restore</span>
                                </button>
                              ) : (<>
                                <button title="Điều chỉnh đơn lẻ" onClick={e => handleOpenAdjust(e, item)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" }}
                                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(139,69,19,0.07)"; e.currentTarget.style.color = "#8B4513"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>tune</span>
                                </button>
                                <button title="Xem lịch sử" onClick={() => handleViewLogs(item.id, item.product_name ?? item.product_id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" }}
                                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(25,127,230,0.07)"; e.currentTarget.style.color = "#197fe6"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>history</span>
                                </button>
                                <button title="Xóa" onClick={() => handleDelete(item.id, item.product_name ?? item.product_id)} disabled={isDeleting} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: isDeleting ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                                  onMouseEnter={e => { if (!isDeleting) { e.currentTarget.style.backgroundColor = "#fee"; e.currentTarget.style.color = "#ef4444"; } }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                                </button>
                              </>)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e9ecef", backgroundColor: "#f8f9fa", padding: "12px 24px" }}>
                <p style={{ fontSize: "14px", color: "#495057", margin: 0 }}>Page {currentPage} of {totalPages} — {totalItems} results</p>
                <nav style={{ display: "inline-flex", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                  <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: currentPage === 1 ? "#adb5bd" : "#495057", backgroundColor: "white", border: "1px solid #dee2e6", borderRadius: "6px 0 0 6px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>Previous</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => handlePageChange(page)} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: page === currentPage ? "white" : "#495057", backgroundColor: page === currentPage ? "#8B4513" : "white", border: "1px solid #dee2e6", borderLeft: "none", cursor: "pointer" }}>{page}</button>
                  ))}
                  <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} style={{ padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: currentPage === totalPages ? "#adb5bd" : "#495057", backgroundColor: "white", border: "1px solid #dee2e6", borderLeft: "none", borderRadius: "0 6px 6px 0", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>Next</button>
                </nav>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: "white", padding: "60px 20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>📦</div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "#212529" }}>No Inventory Items</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>No inventory items found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Adjust Quantity Modal */}
      {adjustPopover.open && adjustPopover.item && (
        <div onClick={() => setAdjustPopover({ open: false, item: null })} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.18)", width: "90%", maxWidth: "400px", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e9ecef", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#212529" }}>Điều chỉnh số lượng</h3>
              <button onClick={() => setAdjustPopover({ open: false, item: null })} style={{ background: "none", border: "none", cursor: "pointer", color: "#6c757d", fontSize: "20px", lineHeight: 1, padding: "0 2px" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "10px 14px", fontSize: "13px" }}>
                <span style={{ fontWeight: "600", color: "#212529" }}>{adjustPopover.item.product_name ?? adjustPopover.item.product_id}</span><br />
                <span style={{ color: "#6c757d" }}>Hiện tại: </span><strong style={{ color: "#212529" }}>{adjustPopover.item.quantity}</strong>
                <span style={{ color: "#6c757d" }}> · Ngưỡng: {adjustPopover.item.alert_threshold}</span>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#28a745", marginBottom: "6px" }}>▲ Tăng</label>
                  <input type="number" min="0" value={popoverIncrease} onChange={e => setPopoverIncrease(e.target.value)} placeholder="0" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `2px solid ${popoverIncrease ? "#28a745" : "#dee2e6"}`, fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#dc3545", marginBottom: "6px" }}>▼ Giảm</label>
                  <input type="number" min="0" value={popoverDecrease} onChange={e => setPopoverDecrease(e.target.value)} placeholder="0" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `2px solid ${popoverDecrease ? "#dc3545" : "#dee2e6"}`, fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              {(popoverIncrease !== "" || popoverDecrease !== "") && (() => {
                const change = (Number(popoverIncrease) || 0) - (Number(popoverDecrease) || 0);
                const newQty = adjustPopover.item!.quantity + change;
                return (
                  <div style={{ borderRadius: "8px", padding: "12px 14px", fontSize: "14px", fontWeight: "600", backgroundColor: change > 0 ? "#d4edda" : change < 0 ? "#f8d7da" : "#e2e3e5", color: change > 0 ? "#155724" : change < 0 ? "#721c24" : "#383d41" }}>
                    Số lượng sau điều chỉnh: <strong>{adjustPopover.item!.quantity}</strong> → <strong style={{ fontSize: "16px" }}>{newQty}</strong>
                    <span style={{ fontWeight: "400", marginLeft: "6px", fontSize: "13px" }}>({change > 0 ? "+" : ""}{change})</span>
                  </div>
                );
              })()}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#495057", marginBottom: "6px" }}>Lý do</label>
                <input type="text" value={popoverReason} onChange={e => setPopoverReason(e.target.value)} placeholder="Nhập lý do điều chỉnh..." style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #dee2e6", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => setAdjustPopover({ open: false, item: null })} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #dee2e6", backgroundColor: "white", cursor: "pointer", fontSize: "14px" }}>Hủy</button>
              <button disabled={isAdjusting || (popoverIncrease === "" && popoverDecrease === "") || ((Number(popoverIncrease) || 0) - (Number(popoverDecrease) || 0) === 0)} onClick={handleAdjustSubmit}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#8B4513", color: "white", cursor: isAdjusting ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "600", opacity: isAdjusting ? 0.7 : 1 }}>
                {isAdjusting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {logsModal.open && (
        <div onClick={() => setLogsModal({ open: false, inventoryId: "", productName: "" })} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", width: "90%", maxWidth: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px rgba(0,0,0,0.12)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e9ecef", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div><h3 style={{ margin: "0 0 2px", fontSize: "18px", fontWeight: "700" }}>Lịch sử điều chỉnh</h3><p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>{logsModal.productName}</p></div>
              <button onClick={() => setLogsModal({ open: false, inventoryId: "", productName: "" })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#6c757d" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {isLogsLoading ? (<p style={{ color: "#6c757d", textAlign: "center", margin: 0 }}>Đang tải lịch sử...</p>
              ) : logs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: "40px", opacity: 0.3, marginBottom: "12px" }}>📋</div><p style={{ color: "#6c757d", margin: 0 }}>Chưa có lịch sử điều chỉnh</p></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {logs.map(log => (
                    <div key={log._id} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: log.change > 0 ? "#d4edda" : "#f8d7da", color: log.change > 0 ? "#28a745" : "#dc3545", fontWeight: "700", fontSize: "13px" }}>{log.change > 0 ? "▲" : "▼"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "700", color: log.change > 0 ? "#28a745" : "#dc3545" }}>{log.change > 0 ? "+" : ""}{log.change}</span>
                          <span style={{ fontSize: "12px", color: "#6c757d" }}>{new Date(log.created_at).toLocaleString("vi-VN")}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>{log.type} · {log.reference_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <InventoryDelete isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, inventoryId: "", productName: "" })} onConfirm={handleDeleteConfirm} inventoryId={deleteModal.inventoryId} productName={deleteModal.productName} />

      {/* Restore Modal */}
      {restoreModal.open && (
        <div onClick={() => setRestoreModal({ open: false, inventoryId: "", productName: "" })} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", width: "90%", maxWidth: "480px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ backgroundColor: "#d4edda", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#28a745" }}>restore</span></div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#212529" }}>Khôi phục Inventory</h2>
              </div>
              <button onClick={() => setRestoreModal({ open: false, inventoryId: "", productName: "" })} style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "#6c757d" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ margin: "0 0 16px", fontSize: "15px", color: "#495057", lineHeight: "1.6" }}>Bạn có chắc chắn muốn khôi phục inventory item này không?</p>
              <div style={{ backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                <div style={{ marginBottom: "8px" }}><span style={{ fontSize: "12px", color: "#6c757d", textTransform: "uppercase", fontWeight: "600" }}>Inventory ID</span><p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#212529", fontWeight: "500" }}>#{restoreModal.inventoryId.slice(-6)}</p></div>
                <div><span style={{ fontSize: "12px", color: "#6c757d", textTransform: "uppercase", fontWeight: "600" }}>Sản phẩm</span><p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#212529", fontWeight: "500" }}>{restoreModal.productName}</p></div>
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setRestoreModal({ open: false, inventoryId: "", productName: "" })} disabled={isRestoring} style={{ padding: "10px 20px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", backgroundColor: "white", color: "#374151" }}>Hủy</button>
              <button onClick={handleRestoreConfirm} disabled={isRestoring} style={{ padding: "10px 20px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: isRestoring ? "not-allowed" : "pointer", backgroundColor: "#28a745", color: "white", opacity: isRestoring ? 0.7 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{isRestoring ? "sync" : "restore"}</span>{isRestoring ? "Đang khôi phục..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
