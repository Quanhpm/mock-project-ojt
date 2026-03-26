import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch, type Resolver } from "react-hook-form";
import { useGetInventories } from "./hooks/useGetInventories";
import { useDeleteInventory } from "./hooks/useDeleteInventory";
import { useRestoreInventory } from "./hooks/useRestoreInventory";
import { useAdjustInventory } from "./hooks/useAdjustInventory";
import { useGetInventoryLogs } from "./hooks/useGetInventoryLogs";
import { useBulkAdjustInventory } from "./hooks/useBulkAdjustInventory";
import { useInventoryExcel } from "./hooks/useInventoryExcel";
import type { BulkAdjustPayload, ImportValidationError, InventoryItem, InventorySearchPayload, InventoryTableRow } from "./inventory.types";
import InventoryDelete from "./InventoryDelete";
import { useToast } from "@/hooks/use-toast.hook";
import { getFranchisesSelect, type FranchiseOptionItem } from "@/apis/endpoints/franchise.api";
import { getProductsByFranchiseWithCategory, type ProductWithCategoriesApiItem } from "@/apis/endpoints/product-category-franchise.api";
import { searchProductFranchises } from "@/apis/endpoints/product-franchise.api";
import { productApi } from "@/apis/endpoints/product.api";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import {
  inventoryCreateDefaultValues,
  inventoryCreateFormSchema,
  type InventoryCreateFormInput,
  type InventoryCreateFormValues,
} from "./inventory-create.validation";
import {
  getInventoryImportFieldPath,
  getInventoryTableFieldPath,
  inventoryTableFormSchema,
} from "./inventory-table.validation";
import {
  getInventoryTableDisplayIndex,
  mapInventoryImportErrorsToTableRows,
} from "./inventory-import-errors";

const getStockStatus = (quantity: number, alertThreshold: number) => {
  if (quantity === 0) return { label: "Out of Stock", color: "#dc3545" };
  if (quantity <= alertThreshold) return { label: "Low Stock", color: "#ffc107" };
  return { label: "In Stock", color: "#28a745" };
};

interface CreateProductOption {
  value: string;
  label: string;
}

type ToolbarLoadingAction =
  | "search"
  | "status"
  | "franchise"
  | "visibility"
  | "clear"
  | null;

const inventoryTableStyleSheet = document.createElement("style");
inventoryTableStyleSheet.textContent = `
  @keyframes inventorySpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  @media (max-width: 1024px) {
    [data-inventory-shell] {
      height: auto;
      min-height: 100dvh;
      overflow-x: hidden;
    }

    [data-inventory-main] {
      height: auto;
      min-height: 100dvh;
      overflow: visible;
    }

    [data-inventory-header],
    [data-inventory-content] {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }

    [data-inventory-content] {
      overflow: visible !important;
    }

    [data-inventory-filter-panel] {
      padding: 12px !important;
    }

    [data-inventory-search-row],
    [data-inventory-filter-row],
    [data-inventory-action-row] {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    [data-inventory-search-row] > *,
    [data-inventory-filter-row] > *,
    [data-inventory-action-row] > * {
      width: 100% !important;
      min-width: 0 !important;
    }

    [data-inventory-search-field] {
      flex: 0 0 auto !important;
    }

    [data-inventory-search-row] button,
    [data-inventory-filter-row] button,
    [data-inventory-action-row] button {
      width: 100%;
      justify-content: center;
    }

    [data-inventory-table-wrap] {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    [data-inventory-table-wrap] table {
      min-width: 980px;
    }

    [data-inventory-pagination] {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    [data-inventory-pagination] > div,
    [data-inventory-pagination] nav {
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
`;
if (!document.head.querySelector("style[data-inventory-table]")) {
  inventoryTableStyleSheet.setAttribute("data-inventory-table", "true");
  document.head.appendChild(inventoryTableStyleSheet);
}

export default function InventoryTable() {
  const { error: toastError, success: toastSuccess } = useToast();
  const SEARCH_DEBOUNCE_DELAY = 400;
  const inventoryTableResolver = zodResolver(
    inventoryTableFormSchema,
  ) as Resolver<
    { items: InventoryTableRow[] },
    undefined,
    { items: InventoryTableRow[] }
  >;

  // === Existing state ===
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toolbarLoadingAction, setToolbarLoadingAction] = useState<ToolbarLoadingAction>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; inventoryId: string; productName: string }>({ isOpen: false, inventoryId: "", productName: "" });
  const [adjustPopover, setAdjustPopover] = useState<{ open: boolean; item: InventoryItem | null }>({ open: false, item: null });
  const [popoverIncrease, setPopoverIncrease] = useState("");
  const [popoverDecrease, setPopoverDecrease] = useState("");
  const [popoverReason, setPopoverReason] = useState("");
  const [logsModal, setLogsModal] = useState<{ open: boolean; inventoryId: string; productName: string }>({ open: false, inventoryId: "", productName: "" });
  const [restoreModal, setRestoreModal] = useState<{ open: boolean; inventoryId: string; productName: string }>({ open: false, inventoryId: "", productName: "" });
  const [pageInput, setPageInput] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("");
  const [franchiseOptions, setFranchiseOptions] = useState<FranchiseOptionItem[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createProductOptions, setCreateProductOptions] = useState<CreateProductOption[]>([]);
  const [isCreateLoadingProducts, setIsCreateLoadingProducts] = useState(false);
  const [createSubmitError, setCreateSubmitError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [activeTooltipKey, setActiveTooltipKey] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const createProductFetchRequestRef = useRef(0);
  const itemsPerPage = 10;

  // === Data hooks ===
  // skipInitialFetch = true: tắt auto-fetch trong hook, để useEffect bên dưới quản lý duy nhất 1 lần gọi
  const { inventories, isLoading, hasLoadedOnce, totalItems, totalPages, refetch } = useGetInventories(true);
  const { deleteInventory, isDeleting } = useDeleteInventory();
  const { restoreInventory, isRestoring } = useRestoreInventory();
  const { adjustInventory, isAdjusting } = useAdjustInventory();
  const { logs, isLoading: isLogsLoading } = useGetInventoryLogs();
  const { bulkAdjust, isAdjusting: isBulkAdjusting } = useBulkAdjustInventory();

  // === React Hook Form + useFieldArray ===
  const methods = useForm<{ items: InventoryTableRow[] }>({
    defaultValues: { items: [] },
    resolver: inventoryTableResolver,
    mode: "onSubmit",
  });
  const { control, register, getValues, trigger, setError, clearErrors, formState: { errors } } = methods;
  const { fields, replace, update } = useFieldArray({ control, name: "items" });
  const createForm = useForm<
    InventoryCreateFormInput,
    undefined,
    InventoryCreateFormValues
  >({
    defaultValues: inventoryCreateDefaultValues,
    resolver: zodResolver(inventoryCreateFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const {
    control: createControl,
    register: registerCreate,
    handleSubmit: handleCreateFormSubmit,
    reset: resetCreateFormFields,
    clearErrors: clearCreateErrors,
    setValue: setCreateValue,
    setFocus: setCreateFocus,
    formState: {
      errors: createErrors,
      isSubmitting: isCreateSubmitting,
    },
  } = createForm;
  const createFranchiseId = useWatch({ control: createControl, name: "franchiseId" });
  type InventoryEditableFieldPath = ReturnType<typeof getInventoryTableFieldPath>;
  const [mappedImportErrorPaths, setMappedImportErrorPaths] = useState<InventoryEditableFieldPath[]>([]);

  const clearMappedImportErrors = useCallback(() => {
    if (mappedImportErrorPaths.length > 0) {
      clearErrors(mappedImportErrorPaths);
      setMappedImportErrorPaths([]);
    }
  }, [clearErrors, mappedImportErrorPaths]);

  const mapImportErrors = useCallback(
    (validationErrors: ImportValidationError[], mappedRows: Record<string, unknown>[]) =>
      mapInventoryImportErrorsToTableRows({
        errors: validationErrors,
        mappedRows,
        currentItems: getValues("items"),
        currentPage,
        itemsPerPage,
      }),
    [currentPage, getValues, itemsPerPage],
  );

  // === Excel hook ===
  const {
    handleExportAll, handleExportSelected,
    fileInputRef, handleImportClick, handleFileChange,
    isParsingFile, importErrors, setImportErrors,
  } = useInventoryExcel({
    getValues,
    replace,
    mapImportErrors,
    onImportStart: () => {
      clearMappedImportErrors();
    },
    onImportSuccess: () => {
      clearMappedImportErrors();
    },
    onImportValidationErrors: (validationErrors, mappedRows) => {
      clearMappedImportErrors();

      const nextPaths: InventoryEditableFieldPath[] = [];
      validationErrors.forEach((error) => {
        if (error.field !== "quantity" && error.field !== "alert_threshold") {
          return;
        }

        const row = mappedRows[error.row - 1];
        const productFranchiseId = String(row?.product_franchise_id ?? "").trim();
        if (!productFranchiseId) return;

        const targetIndex = getValues("items").findIndex(
          (item) => item.product_franchise_id === productFranchiseId,
        );
        if (targetIndex === -1) return;

        const path = getInventoryImportFieldPath(targetIndex, error.field);
        setError(path, {
          type: "import",
          message: error.message.replace(/^Row \d{2}:\s*/, ""),
        });
        nextPaths.push(path);
      });

      setMappedImportErrorPaths(nextPaths);
    },
  });

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

  useEffect(() => {
    const loadFranchiseOptions = async () => {
      try {
        const franchises = await getFranchisesSelect();
        setFranchiseOptions(franchises ?? []);
      } catch {
        setFranchiseOptions([]);
      }
    };

    void loadFranchiseOptions();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setToolbarLoadingAction(null);
    }
  }, [isLoading]);

  useEffect(() => {
    const requestId = createProductFetchRequestRef.current + 1;
    createProductFetchRequestRef.current = requestId;

    setCreateValue("productFranchiseId", "");
    clearCreateErrors("productFranchiseId");
    setCreateProductOptions([]);

    if (!createFranchiseId) {
      setIsCreateLoadingProducts(false);
      return;
    }

    setIsCreateLoadingProducts(true);

    const loadCreateProductOptions = async () => {
      try {
        const categoryBoundProducts = await getProductsByFranchiseWithCategory(createFranchiseId);
        if (createProductFetchRequestRef.current !== requestId) {
          return;
        }

        const productFranchiseList = (categoryBoundProducts ?? []).filter(
          (item) => item.is_deleted !== true && item.is_active !== false,
        );

        if (productFranchiseList.length > 0) {
          setCreateProductOptions(
            productFranchiseList.map((item: ProductWithCategoriesApiItem) => ({
              value: item.product_franchise_id,
              label: item.product_name || "Product",
            })),
          );
          return;
        }

        const [fallbackResponse, masterProducts] = await Promise.all([
          searchProductFranchises({
            searchCondition: {
              franchise_id: createFranchiseId,
              is_deleted: false,
              is_active: true,
            },
            pageInfo: {
              pageNum: 1,
              pageSize: 500,
            },
          }),
          productApi.searchProducts({
            searchCondition: {
              is_deleted: false,
            },
            pageInfo: {
              pageNum: 1,
              pageSize: 1000,
            },
          }),
        ]);

        if (createProductFetchRequestRef.current !== requestId) {
          return;
        }

        const productNameById = new Map(
          (masterProducts.data ?? []).map((product) => [product.id, product.name] as const),
        );

        const fallbackOptions = (fallbackResponse.data ?? []).map((item) => ({
          value: item.id,
          label: productNameById.get(item.product_id) || "Product",
        }));

        setCreateProductOptions(fallbackOptions);
      } catch {
        if (createProductFetchRequestRef.current === requestId) {
          toastError("Error", "Failed to load franchise products.");
        }
      } finally {
        if (createProductFetchRequestRef.current === requestId) {
          setIsCreateLoadingProducts(false);
        }
      }
    };

    void loadCreateProductOptions();
  }, [clearCreateErrors, createFranchiseId, setCreateValue, toastError]);

  const buildPayload = useCallback((page: number): InventorySearchPayload => ({
    searchCondition: {
      is_deleted: showDeleted,
      ...(franchiseFilter ? { franchise_id: franchiseFilter } : {}),
      ...(debouncedSearchTerm ? { keyword: debouncedSearchTerm } : {}),
    },
    pageInfo: { pageNum: page, pageSize: itemsPerPage },
  }), [debouncedSearchTerm, franchiseFilter, itemsPerPage, showDeleted]);

  useEffect(() => {
    const nextKeyword = searchInput.trim();

    if (nextKeyword === debouncedSearchTerm) return;

    const debounceTimer = window.setTimeout(() => {
      setToolbarLoadingAction("search");
      setDebouncedSearchTerm(nextKeyword);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => window.clearTimeout(debounceTimer);
  }, [SEARCH_DEBOUNCE_DELAY, debouncedSearchTerm, searchInput]);

  useEffect(() => {
    void refetch(buildPayload(currentPage));
  }, [buildPayload, currentPage, debouncedSearchTerm, refetch]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); searchInputRef.current?.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // === Watched values for selected count ===
  const watchedItems = useWatch({ control, name: "items" });
  const selectedCount = watchedItems?.filter((r) => r._selected).length ?? 0;

  // === Dirty check: whether any row has unsaved changes ===
  const hasDirtyRows = watchedItems?.some(
    (r) => r._editQuantity !== r._originalQuantity || r._editAlertThreshold !== r._originalAlertThreshold
  ) ?? false;

  // === Safe page change: warn before losing unsaved edits ===
  const handlePageChange = useCallback((newPage: number) => {
    if (hasDirtyRows) {
      const confirmed = window.confirm(
        "You have unsaved changes. If you switch pages, those changes will be lost.\n\nDo you want to continue?"
      );
      if (!confirmed) return;
    }
    setCurrentPage(newPage);
  }, [hasDirtyRows]);

  // === Client-side status filter ===
  const filteredFields = useMemo(() => fields.filter((_field, index) => {
    const item = watchedItems?.[index];
    if (!item) return false;
    const stockStatus = getStockStatus(item._editQuantity, item._editAlertThreshold);
    const matchesStatus = statusFilter === "all"
      || (statusFilter === "in-stock" && stockStatus.label === "In Stock")
      || (statusFilter === "low-stock" && stockStatus.label === "Low Stock")
      || (statusFilter === "out-of-stock" && stockStatus.label === "Out of Stock");
    return matchesStatus;
  }), [fields, statusFilter, watchedItems]);

  // === Handlers ===
  const handleClearFilters = useCallback(() => {
    setToolbarLoadingAction("clear");
    setSearchInput("");
    setDebouncedSearchTerm("");
    setStatusFilter("all");
    setFranchiseFilter("");
    setShowDeleted(false);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback(() => {
    setToolbarLoadingAction("search");
    setDebouncedSearchTerm(searchInput.trim());
    setCurrentPage(1);
  }, [searchInput]);

  const handleStatusChange = useCallback(async (nextStatus: string) => {
    setToolbarLoadingAction("status");
    setStatusFilter(nextStatus);
    try {
      await refetch(buildPayload(currentPage));
    } finally {
      // Cleared by the loading effect after the request settles.
    }
  }, [buildPayload, currentPage, refetch]);

  const handleSelectAll = useCallback((checked: boolean) => {
    const items = getValues("items");
    // Only toggle rows currently visible after filtering.
    const visibleIds = new Set(filteredFields.map(f => f.id));
    replace(items.map((item, i) => {
      const fieldId = fields[i]?.id;
      if (visibleIds.has(fieldId)) return { ...item, _selected: checked };
      return item;
    }));
  }, [getValues, replace, filteredFields, fields]);

  const handleToggleRow = useCallback((index: number) => {
    const item = getValues(`items.${index}`);
    update(index, { ...item, _selected: !item._selected });
  }, [getValues, update]);

  // === Update Selected → API ===
  const handleUpdateSelected = useCallback(() => {
    const currentItems = getValues("items");
    const selectedIndexes = currentItems
      .map((row, index) => (row._selected ? index : -1))
      .filter((index) => index >= 0);
    const selectedRows = selectedIndexes.map((index) => currentItems[index]);

    if (selectedRows.length === 0) {
      toastError("Error", "Please select at least one row to update.");
      return;
    }

    const selectedPaths = selectedIndexes.flatMap((index) => [
      getInventoryTableFieldPath(index, "_editQuantity"),
      getInventoryTableFieldPath(index, "_editAlertThreshold"),
    ]);

    void trigger(selectedPaths).then((isValid) => {
      if (!isValid) {
        const firstInvalidPath = selectedPaths.find(
          (path) => !!methods.getFieldState(path).error,
        );
        if (firstInvalidPath) {
          const firstInvalidInput = document.querySelector<HTMLInputElement>(
            `input[name="${firstInvalidPath}"]`,
          );
          if (firstInvalidInput) {
            firstInvalidInput.scrollIntoView({ behavior: "smooth", block: "center" });
            firstInvalidInput.focus();
          }
        }
        toastError("Invalid Data", "Please check the highlighted fields.");
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
        refetch(buildPayload(currentPage), { force: true });
      });
    });
  }, [buildPayload, bulkAdjust, currentPage, getValues, methods, refetch, toastError, trigger]);

  // === Legacy handlers (logs, delete, restore) ===
  const handleAdjustSubmit = () => {
    if (!adjustPopover.item) return;
    const change = (Number(popoverIncrease) || 0) - (Number(popoverDecrease) || 0);
    if (change === 0) return;

    adjustInventory({
      product_franchise_id: adjustPopover.item.product_franchise_id,
      inventory_id: adjustPopover.item.id,
      alert_threshold: adjustPopover.item.alert_threshold,
      change,
      reason: popoverReason.trim() || "Quantity adjustment",
    }, () => {
      setAdjustPopover({ open: false, item: null });
      refetch(buildPayload(currentPage), { force: true });
    });
  };

  const handleDelete = (inventoryId: string, productName: string) => { setDeleteModal({ isOpen: true, inventoryId, productName }); };
  const handleDeleteConfirm = () => {
    const nextPage = currentPage > 1 && inventories.length === 1 ? 1 : currentPage;

    deleteInventory(deleteModal.inventoryId, () => {
      setDeleteModal({ isOpen: false, inventoryId: "", productName: "" });
      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      }
      refetch(buildPayload(nextPage));
    });
  };
  const handleRestore = (inventoryId: string, productName: string) => { setRestoreModal({ open: true, inventoryId, productName }); };
  const handleRestoreConfirm = () => { restoreInventory(restoreModal.inventoryId, () => { setRestoreModal({ open: false, inventoryId: "", productName: "" }); refetch(buildPayload(currentPage)); }); };

  const resetCreateForm = useCallback(() => {
    createProductFetchRequestRef.current += 1;
    resetCreateFormFields(inventoryCreateDefaultValues);
    setCreateProductOptions([]);
    setIsCreateLoadingProducts(false);
    setCreateSubmitError("");
  }, [resetCreateFormFields]);

  const handleOpenCreateModal = useCallback(() => {
    resetCreateForm();
    setCreateModalOpen(true);
    window.setTimeout(() => {
      setCreateFocus("franchiseId");
    }, 0);
  }, [resetCreateForm, setCreateFocus]);

  const handleCloseCreateModal = useCallback(() => {
    if (isCreateSubmitting) return;
    setCreateModalOpen(false);
    resetCreateForm();
  }, [isCreateSubmitting, resetCreateForm]);

  const handleCreateSubmit = useCallback(async (values: InventoryCreateFormValues) => {
    setCreateSubmitError("");

    try {
      await inventoryApi.createInventory({
        product_franchise_id: values.productFranchiseId,
        quantity: values.quantity,
        alert_threshold: values.alertThreshold,
      });
      toastSuccess("Created", "New inventory item has been added.");
      setCreateModalOpen(false);
      resetCreateForm();
      await refetch(buildPayload(currentPage));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create inventory.";
      setCreateSubmitError(message);
    }
  }, [
    buildPayload,
    currentPage,
    refetch,
    resetCreateForm,
    toastSuccess,
  ]);

  const handleCreateInvalidSubmit = useCallback(() => {
    setCreateSubmitError("");
  }, []);

  // === Styles ===
  const btnOutline: React.CSSProperties = { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid #8B4513", backgroundColor: "white", color: "#8B4513", fontWeight: "600", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" };
  const btnPrimary: React.CSSProperties = { ...btnOutline, backgroundColor: "#8B4513", color: "white", border: "none" };
  const editInputStyle: React.CSSProperties = { width: "80px", padding: "6px 8px", borderRadius: "6px", border: "1px solid #dee2e6", fontSize: "14px", textAlign: "center", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" };
  const errorInputStyle: React.CSSProperties = {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    boxShadow: "0 0 0 1px rgba(220,38,38,0.12)",
  };
  const createFieldStyle = (hasError: boolean): React.CSSProperties => ({
    height: "38px",
    border: `1px solid ${hasError ? "#dc2626" : "#e0e0e0"}`,
    borderRadius: "8px",
    padding: "0 10px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: hasError ? "#fef2f2" : "white",
  });
  const toolbarSearchInputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    border: "1px solid #d9dee7",
    padding: "0 16px 0 42px",
    color: "#475569",
    backgroundColor: "#f8fafc",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  };
  const toolbarSelectStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    minWidth: "160px",
    height: "44px",
    appearance: "none",
    borderRadius: "10px",
    border: "1px solid #d9dee7",
    padding: "0 38px 0 14px",
    color: "#111827",
    backgroundColor: "#fcfcfd",
    outline: "none",
    fontSize: "14px",
    cursor: "pointer",
    boxSizing: "border-box",
  };
  const toolbarFilterButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "44px",
    minWidth: "122px",
    padding: "0 14px",
    borderRadius: "10px",
    border: "1px solid #d9dee7",
    backgroundColor: "#fcfcfd",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  };
  const toolbarSearchButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    height: "48px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#8B4513",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  };
  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#7f1d1d",
    color: "white",
    padding: "8px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    boxShadow: "0 8px 18px rgba(127,29,29,0.25)",
    zIndex: 50,
    pointerEvents: "none",
  };

  const handleEditableFieldChange = useCallback((path: `items.${number}._editQuantity` | `items.${number}._editAlertThreshold`) => {
    window.setTimeout(() => {
      void trigger(path).then((isValid) => {
        if (isValid) {
          clearErrors(path);
          setMappedImportErrorPaths((prev) => prev.filter((item) => item !== path));
          if (activeTooltipKey === path) {
            setActiveTooltipKey(null);
          }
        }
      });
    }, 0);
  }, [activeTooltipKey, clearErrors, trigger]);

  const handleNumericKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedControlKeys = new Set([
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ]);

    if (e.ctrlKey || e.metaKey) {
      return;
    }

    if (allowedControlKeys.has(e.key)) {
      return;
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }, []);

  const handleNumericPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pastedText.trim())) {
      e.preventDefault();
    }
  }, []);

  const shouldShowBlockingTableLoading = isLoading && !hasLoadedOnce;
  const isToolbarLoading = isLoading && hasLoadedOnce;

  return (
    <div data-inventory-shell style={{ display: "flex", minHeight: "100dvh", width: "100%", overflow: "hidden" }}>
      <main data-inventory-main style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100dvh", overflow: "hidden", position: "relative" }}>
        {/* Header */}
        <header data-inventory-header style={{ width: "100%", padding: "24px 32px", display: "flex", flexDirection: "column", gap: "24px", flexShrink: 0, zIndex: 10 }}>
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
            <div data-inventory-action-row style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
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
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>upload</span>{isParsingFile ? "Processing..." : "Import"}
              </button>
              <input type="file" accept=".xlsx,.xls,.csv" hidden ref={fileInputRef} onChange={handleFileChange} />
              <button onClick={handleUpdateSelected} disabled={selectedCount === 0 || isBulkAdjusting}
                style={{ ...btnPrimary, opacity: (selectedCount === 0 || isBulkAdjusting) ? 0.5 : 1, cursor: (selectedCount === 0 || isBulkAdjusting) ? "not-allowed" : "pointer" }}
                onMouseEnter={e => { if (selectedCount > 0 && !isBulkAdjusting) e.currentTarget.style.backgroundColor = "#6d3610"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#8B4513"; }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>sync</span>
                {isBulkAdjusting ? "Updating..." : `Update Selected (${selectedCount})`}
              </button>
              <button onClick={handleOpenCreateModal}
                style={{ ...btnPrimary }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#6d3610"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#8B4513"}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>Add Inventory
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div data-inventory-content style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "0 32px 32px", gap: "16px", minHeight: 0 }}>
          {/* Filters */}
          <div data-inventory-filter-panel style={{ backgroundColor: "white", padding: "14px", borderRadius: "16px", boxShadow: "0 1px 3px rgba(15,23,42,0.05)", border: "1px solid #e5e7eb", flexShrink: 0, zIndex: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div data-inventory-search-row style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                <div data-inventory-search-field style={{ flex: "1 1 360px", position: "relative", minWidth: 0 }}>
                  <div style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Search by product name... (Ctrl+k)"
                    style={toolbarSearchInputStyle}
                  />
                </div>
                <button onClick={handleSearch} style={{ ...toolbarSearchButtonStyle, minWidth: "120px" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#6d3610"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#8B4513"}>
                  {isToolbarLoading && toolbarLoadingAction === "search" ? (
                    <>
                      <span style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.45)", borderTopColor: "white", animation: "inventorySpin 0.8s linear infinite" }} />
                      Searching...
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                      Search
                    </>
                  )}
                </button>
              </div>

              <div data-inventory-filter-row style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "flex-start" }}>
                <div style={{ position: "relative", minWidth: "160px" }}>
                  <select value={statusFilter} onChange={e => void handleStatusChange(e.target.value)} style={toolbarSelectStyle}>
                    <option value="all">All Status</option><option value="in-stock">In Stock</option><option value="low-stock">Low Stock</option><option value="out-of-stock">Out of Stock</option>
                  </select>
                  <div style={{ pointerEvents: "none", position: "absolute", top: "50%", right: "14px", transform: "translateY(-50%)", color: "#9ca3af" }}>
                    {isToolbarLoading && toolbarLoadingAction === "status" ? (
                      <span style={{ display: "block", width: "14px", height: "14px", borderRadius: "50%", border: "2px solid #d1d5db", borderTopColor: "#8B4513", animation: "inventorySpin 0.8s linear infinite" }} />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                    )}
                  </div>
                </div>

                <div style={{ position: "relative", minWidth: "160px" }}>
                  <select value={franchiseFilter} onChange={e => { setToolbarLoadingAction("franchise"); setFranchiseFilter(e.target.value); setCurrentPage(1); }} style={toolbarSelectStyle}>
                    <option value="">Sort by Franchise</option>
                    {franchiseOptions.map((franchise) => (
                      <option key={franchise.value} value={franchise.value}>
                        {franchise.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ pointerEvents: "none", position: "absolute", top: "50%", right: "14px", transform: "translateY(-50%)", color: "#9ca3af" }}>
                    {isToolbarLoading && toolbarLoadingAction === "franchise" ? (
                      <span style={{ display: "block", width: "14px", height: "14px", borderRadius: "50%", border: "2px solid #d1d5db", borderTopColor: "#8B4513", animation: "inventorySpin 0.8s linear infinite" }} />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => { setToolbarLoadingAction("visibility"); setShowDeleted(d => !d); setCurrentPage(1); }}
                  style={{
                    ...toolbarFilterButtonStyle,
                    gap: "8px",
                    border: showDeleted ? "1px solid #fb923c" : "1px solid #d1d5db",
                    backgroundColor: showDeleted ? "#fff7ed" : "white",
                    color: showDeleted ? "#f97316" : "#6b7280",
                    boxShadow: showDeleted ? "0 0 0 1px rgba(249,115,22,0.08)" : "none",
                  }}
                >
                  {isToolbarLoading && toolbarLoadingAction === "visibility" ? (
                    <span style={{ width: "15px", height: "15px", borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "inventorySpin 0.8s linear infinite" }} />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  )}
                  {showDeleted ? "Deleted" : "Current"}
                </button>

                <button
                  onClick={handleClearFilters}
                  style={{
                    ...toolbarFilterButtonStyle,
                    gap: "8px",
                    backgroundColor: "#f4f6f8",
                    color: "#334155",
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#eceff3"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f4f6f8"}
                >
                  {isToolbarLoading && toolbarLoadingAction === "clear" ? (
                    <>
                      <span style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid #cbd5e1", borderTopColor: "#334155", animation: "inventorySpin 0.8s linear infinite" }} />
                      Clearing...
                    </>
                  ) : (
                    "Clear Filters"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner (Import Validation Errors) */}
          {importErrors.length > 0 && (
            <div style={{ backgroundColor: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", padding: "16px", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4 style={{ margin: 0, color: "#c53030", fontSize: "14px", fontWeight: "700" }}>⚠️ Import Errors ({importErrors.length} issues):</h4>
                <button onClick={() => { setImportErrors([]); setActiveTooltipKey(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#c53030", fontSize: "18px", lineHeight: 1, padding: "0 4px" }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {importErrors.map((err, i) => (
                  <p key={i} style={{ margin: 0, fontSize: "13px", color: "#c53030", lineHeight: "1.5" }}>{err.message}</p>
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          {shouldShowBlockingTableLoading ? (
            <div style={{ backgroundColor: "white", padding: "60px 20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", textAlign: "center", flexShrink: 0 }}>
              <p style={{ color: "#6c757d", fontSize: "16px" }}>Loading...</p>
            </div>
          ) : filteredFields.length > 0 ? (
            <div data-inventory-table-card style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e9ecef", overflow: "hidden", minHeight: 0, position: "relative" }}>
              <div data-inventory-table-wrap style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
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
                      <th style={{ width: "7%", padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>No.</th>
                      <th style={{ width: "28%", padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Product</th>
                      <th style={{ width: "22%", padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Franchise</th>
                      <th style={{ width: "12%", padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantity</th>
                      <th style={{ width: "13%", padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Alert Threshold</th>
                      <th style={{ width: "10%", padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Status
                      </th>
                      <th style={{ width: "116px", padding: "12px 16px", fontSize: "11px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: "1px solid #e9ecef" }}>
                    {filteredFields.map((field) => {
                      const index = fields.findIndex(f => f.id === field.id);
                      const item = watchedItems?.[index];
                      if (!item) return null;
                      const stockStatus = getStockStatus(item._editQuantity, item._editAlertThreshold);
                      const quantityPath = getInventoryTableFieldPath(index, "_editQuantity");
                      const thresholdPath = getInventoryTableFieldPath(index, "_editAlertThreshold");
                      const quantityError = errors.items?.[index]?._editQuantity;
                      const thresholdError = errors.items?.[index]?._editAlertThreshold;
                      const displayIndex = getInventoryTableDisplayIndex(currentPage, itemsPerPage, index);
                      return (
                        <tr key={field.id} style={{ borderBottom: "1px solid #e9ecef", backgroundColor: item._selected ? "#fff8f2" : "transparent", transition: "background-color 0.15s" }}
                          onMouseEnter={e => { if (!item._selected) e.currentTarget.style.backgroundColor = "#f8f9fa"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = item._selected ? "#fff8f2" : "transparent"; }}>
                          <td style={{ padding: "16px" }}>
                            <input type="checkbox" checked={item._selected} onChange={() => handleToggleRow(index)}
                              style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#8B4513" }} />
                          </td>
                          <td style={{ padding: "16px", fontSize: "14px", fontWeight: "700", color: "#212529" }}>
                            {String(displayIndex).padStart(2, "0")}
                          </td>
                          <td style={{ padding: "16px" }}><span style={{ fontSize: "14px", fontWeight: "600", color: "#212529" }}>{item.product_name ?? item.product_id}</span></td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "#495057" }}>{item.franchise_name ?? item.franchise_id}</td>
                          <td style={{ padding: "16px" }}>
                            <div
                              style={{ position: "relative", display: "inline-block" }}
                              onMouseEnter={() => quantityError?.message && setActiveTooltipKey(quantityPath)}
                              onMouseLeave={() => activeTooltipKey === quantityPath && setActiveTooltipKey(null)}
                            >
                              <input type="number" min={0} {...register(quantityPath, { valueAsNumber: true, onChange: () => handleEditableFieldChange(quantityPath) })}
                                style={{
                                  ...editInputStyle,
                                  borderColor: item._editQuantity !== item._originalQuantity ? "#8B4513" : "#dee2e6",
                                  fontWeight: item._editQuantity !== item._originalQuantity ? "700" : "400",
                                  ...(quantityError ? errorInputStyle : {}),
                                }}
                                onKeyDown={handleNumericKeyDown}
                                onPaste={handleNumericPaste}
                                onFocus={e => { e.currentTarget.style.borderColor = quantityError ? "#dc2626" : "#8B4513"; if (quantityError?.message) setActiveTooltipKey(quantityPath); }}
                                onBlur={e => {
                                  window.setTimeout(() => {
                                    if (activeTooltipKey === quantityPath) setActiveTooltipKey(null);
                                  }, 0);
                                  if (!quantityError && item._editQuantity === item._originalQuantity) e.currentTarget.style.borderColor = "#dee2e6";
                                }} />
                              {quantityError?.message && activeTooltipKey === quantityPath && (
                                <div style={tooltipStyle}>{quantityError.message}</div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <div
                              style={{ position: "relative", display: "inline-block" }}
                              onMouseEnter={() => thresholdError?.message && setActiveTooltipKey(thresholdPath)}
                              onMouseLeave={() => activeTooltipKey === thresholdPath && setActiveTooltipKey(null)}
                            >
                              <input type="number" min={0} {...register(thresholdPath, { valueAsNumber: true, onChange: () => handleEditableFieldChange(thresholdPath) })}
                                style={{
                                  ...editInputStyle,
                                  borderColor: item._editAlertThreshold !== item._originalAlertThreshold ? "#8B4513" : "#dee2e6",
                                  fontWeight: item._editAlertThreshold !== item._originalAlertThreshold ? "700" : "400",
                                  ...(thresholdError ? errorInputStyle : {}),
                                }}
                                onKeyDown={handleNumericKeyDown}
                                onPaste={handleNumericPaste}
                                onFocus={e => { e.currentTarget.style.borderColor = thresholdError ? "#dc2626" : "#8B4513"; if (thresholdError?.message) setActiveTooltipKey(thresholdPath); }}
                                onBlur={e => {
                                  window.setTimeout(() => {
                                    if (activeTooltipKey === thresholdPath) setActiveTooltipKey(null);
                                  }, 0);
                                  if (!thresholdError && item._editAlertThreshold === item._originalAlertThreshold) e.currentTarget.style.borderColor = "#dee2e6";
                                }} />
                              {thresholdError?.message && activeTooltipKey === thresholdPath && (
                                <div style={tooltipStyle}>{thresholdError.message}</div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "12px", backgroundColor: stockStatus.label === "In Stock" ? "#d4edda" : stockStatus.label === "Low Stock" ? "#fff3cd" : "#f8d7da", color: stockStatus.color }}>{stockStatus.label}</span>
                          </td>
                          <td style={{ padding: "16px", width: "76px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                              {showDeleted ? (
                                <button title="Restore" onClick={() => handleRestore(item.id, item.product_name ?? item.product_id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" }}
                                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#e8f5e9"; e.currentTarget.style.color = "#28a745"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>restore</span>
                                </button>
                              ) : (<>
                                <button title="Delete" onClick={() => handleDelete(item.id, item.product_name ?? item.product_id)} disabled={isDeleting} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", borderRadius: "6px", backgroundColor: "transparent", color: "#94a3b8", cursor: isDeleting ? "not-allowed" : "pointer", transition: "all 0.2s" }}
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
              <div data-inventory-pagination style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e9ecef", backgroundColor: "#f8f9fa", padding: "12px 24px" }}>
                <p style={{ fontSize: "14px", color: "#495057", margin: 0 }}>Page {currentPage} of {totalPages} — {totalItems} results</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <nav
                    aria-label="Pagination"
                    style={{ display: "inline-flex" }}
                  >
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: currentPage === 1 ? "#9ca3af" : "#374151",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderTopLeftRadius: "6px",
                        borderBottomLeftRadius: "6px",
                        borderRight: "none",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== 1) {
                          e.currentTarget.style.backgroundColor = "#f9fafb";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.borderColor = "#e5e7eb";
                      }}
                    >
                      Previous
                    </button>
                    {(() => {
                      const pages: (number | "...")[] = [];
                      if (totalPages <= 5) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        const ws = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
                        const we = ws + 2;
                        if (ws > 2) pages.push(1, "..."); else for (let i = 1; i < ws; i++) pages.push(i);
                        for (let i = ws; i <= we; i++) pages.push(i);
                        if (we < totalPages - 1) pages.push("...", totalPages); else for (let i = we + 1; i <= totalPages; i++) pages.push(i);
                      }
                      return pages.map((page, idx) =>
                        page === "..." ? (
                          <span key={`e-${idx}`} style={{ display: "inline-flex", alignItems: "center", padding: "0 4px", fontSize: "14px", color: "#6b7280" }}>...</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "40px",
                              padding: "8px 12px",
                              fontSize: "14px",
                              fontWeight: currentPage === page ? "600" : "500",
                              color: currentPage === page ? "white" : "#374151",
                              backgroundColor: currentPage === page ? "#8B4513" : "white",
                              border: "1px solid",
                              borderColor: currentPage === page ? "#8B4513" : "#e5e7eb",
                              borderRight: "none",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              if (currentPage !== page) {
                                e.currentTarget.style.backgroundColor = "#f9fafb";
                                e.currentTarget.style.borderColor = "#d1d5db";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentPage !== page) {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                              } else {
                                e.currentTarget.style.backgroundColor = "#8B4513";
                                e.currentTarget.style.borderColor = "#8B4513";
                              }
                            }}
                          >
                            {page}
                          </button>
                        )
                      );
                    })()}
                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages || totalPages === 0}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color:
                          currentPage === totalPages || totalPages === 0 ? "#9ca3af" : "#374151",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderTopRightRadius: "6px",
                        borderBottomRightRadius: "6px",
                        cursor:
                          currentPage === totalPages || totalPages === 0
                            ? "not-allowed"
                            : "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== totalPages && totalPages !== 0) {
                          e.currentTarget.style.backgroundColor = "#f9fafb";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.borderColor = "#e5e7eb";
                      }}
                    >
                      Next
                    </button>
                  </nav>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap" }}>Go to page</span>
                    <input
                      type="number" min={1} max={totalPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const n = parseInt(pageInput, 10);
                          if (!isNaN(n) && n >= 1 && n <= totalPages) handlePageChange(n);
                          setPageInput("");
                        }
                      }}
                      placeholder={String(currentPage)}
                      style={{ width: "52px", height: "34px", border: "1px solid #e5e7eb", borderRadius: "6px", textAlign: "center", fontSize: "14px", outline: "none", padding: "0 4px" }}
                    />
                  </div>
                </div>
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
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.18)", width: "min(400px, calc(100vw - 24px))", maxHeight: "calc(100dvh - 24px)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e9ecef", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#212529" }}>Adjust Quantity</h3>
              <button onClick={() => setAdjustPopover({ open: false, item: null })} style={{ background: "none", border: "none", cursor: "pointer", color: "#6c757d", fontSize: "20px", lineHeight: 1, padding: "0 2px" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "10px 14px", fontSize: "13px" }}>
                <span style={{ fontWeight: "600", color: "#212529" }}>{adjustPopover.item.product_name ?? adjustPopover.item.product_id}</span><br />
                <span style={{ color: "#6c757d" }}>Current: </span><strong style={{ color: "#212529" }}>{adjustPopover.item.quantity}</strong>
                <span style={{ color: "#6c757d" }}> · Threshold: {adjustPopover.item.alert_threshold}</span>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#28a745", marginBottom: "6px" }}>▲ Increase</label>
                  <input type="number" min="0" value={popoverIncrease} onChange={e => setPopoverIncrease(e.target.value)} placeholder="0" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `2px solid ${popoverIncrease ? "#28a745" : "#dee2e6"}`, fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#dc3545", marginBottom: "6px" }}>▼ Decrease</label>
                  <input type="number" min="0" value={popoverDecrease} onChange={e => setPopoverDecrease(e.target.value)} placeholder="0" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `2px solid ${popoverDecrease ? "#dc3545" : "#dee2e6"}`, fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              {(popoverIncrease !== "" || popoverDecrease !== "") && (() => {
                const change = (Number(popoverIncrease) || 0) - (Number(popoverDecrease) || 0);
                const newQty = adjustPopover.item!.quantity + change;
                return (
                  <div style={{ borderRadius: "8px", padding: "12px 14px", fontSize: "14px", fontWeight: "600", backgroundColor: change > 0 ? "#d4edda" : change < 0 ? "#f8d7da" : "#e2e3e5", color: change > 0 ? "#155724" : change < 0 ? "#721c24" : "#383d41" }}>
                    Quantity after adjustment: <strong>{adjustPopover.item!.quantity}</strong> → <strong style={{ fontSize: "16px" }}>{newQty}</strong>
                    <span style={{ fontWeight: "400", marginLeft: "6px", fontSize: "13px" }}>({change > 0 ? "+" : ""}{change})</span>
                  </div>
                );
              })()}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#495057", marginBottom: "6px" }}>Reason</label>
                <input type="text" value={popoverReason} onChange={e => setPopoverReason(e.target.value)} placeholder="Enter adjustment reason..." style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #dee2e6", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef", display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={() => setAdjustPopover({ open: false, item: null })} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #dee2e6", backgroundColor: "white", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
              <button disabled={isAdjusting || (popoverIncrease === "" && popoverDecrease === "") || ((Number(popoverIncrease) || 0) - (Number(popoverDecrease) || 0) === 0)} onClick={handleAdjustSubmit}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#8B4513", color: "white", cursor: isAdjusting ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "600", opacity: isAdjusting ? 0.7 : 1 }}>
                {isAdjusting ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {logsModal.open && (
        <div onClick={() => setLogsModal({ open: false, inventoryId: "", productName: "" })} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", width: "min(600px, calc(100vw - 24px))", maxHeight: "calc(100dvh - 24px)", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px rgba(0,0,0,0.12)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e9ecef", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div><h3 style={{ margin: "0 0 2px", fontSize: "18px", fontWeight: "700" }}>Adjustment History</h3><p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>{logsModal.productName}</p></div>
              <button onClick={() => setLogsModal({ open: false, inventoryId: "", productName: "" })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#6c757d" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {isLogsLoading ? (<p style={{ color: "#6c757d", textAlign: "center", margin: 0 }}>Loading history...</p>
              ) : logs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: "40px", opacity: 0.3, marginBottom: "12px" }}>📋</div><p style={{ color: "#6c757d", margin: 0 }}>No adjustment history found.</p></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {logs.map(log => (
                    <div key={log._id} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: log.change > 0 ? "#d4edda" : "#f8d7da", color: log.change > 0 ? "#28a745" : "#dc3545", fontWeight: "700", fontSize: "13px" }}>{log.change > 0 ? "▲" : "▼"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "700", color: log.change > 0 ? "#28a745" : "#dc3545" }}>{log.change > 0 ? "+" : ""}{log.change}</span>
                          <span style={{ fontSize: "12px", color: "#6c757d" }}>{new Date(log.created_at).toLocaleString("en-US")}</span>
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

      {/* Create Inventory Modal */}
      {createModalOpen && (
        <div
          onClick={handleCloseCreateModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "520px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 20px 30px rgba(0,0,0,0.18)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "calc(100dvh - 32px)",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e9ecef", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#212529" }}>Add Inventory</h3>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                disabled={isCreateSubmitting}
                style={{ border: "none", background: "none", fontSize: "20px", color: "#6c757d", cursor: isCreateSubmitting ? "not-allowed" : "pointer" }}
              >
                ✕
              </button>
            </div>

            <form
              noValidate
              onSubmit={handleCreateFormSubmit(handleCreateSubmit, handleCreateInvalidSubmit)}
              style={{ display: "flex", flexDirection: "column", minHeight: 0 }}
            >
              <div style={{ padding: "20px", display: "grid", gap: "14px", overflowY: "auto" }}>
                <div style={{ display: "grid", gap: "6px" }}>
                  <label style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>
                    Franchise
                  </label>
                  <select
                    {...registerCreate("franchiseId")}
                    style={createFieldStyle(!!createErrors.franchiseId)}
                    disabled={isCreateSubmitting}
                  >
                    <option value="">-- Select franchise --</option>
                    {franchiseOptions.map((franchise) => (
                      <option key={franchise.value} value={franchise.value}>{franchise.name}</option>
                    ))}
                  </select>
                  {createErrors.franchiseId && (
                    <p className="text-sm text-red-600" style={{ margin: 0 }}>
                      {createErrors.franchiseId.message}
                    </p>
                  )}
                </div>

                <div style={{ display: "grid", gap: "6px" }}>
                  <label style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>
                    Product
                  </label>
                  <select
                    {...registerCreate("productFranchiseId")}
                    style={createFieldStyle(!!createErrors.productFranchiseId)}
                    disabled={!createFranchiseId || isCreateLoadingProducts || isCreateSubmitting}
                  >
                    <option value="">
                      {!createFranchiseId
                        ? "-- Select franchise first --"
                        : isCreateLoadingProducts
                          ? "Loading products..."
                          : createProductOptions.length === 0
                            ? "No products available"
                            : "-- Select product --"}
                    </option>
                    {createProductOptions.map((product) => (
                      <option key={product.value} value={product.value}>
                        {product.label}
                      </option>
                    ))}
                  </select>
                  {createErrors.productFranchiseId && (
                    <p className="text-sm text-red-600" style={{ margin: 0 }}>
                      {createErrors.productFranchiseId.message}
                    </p>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
                  <div style={{ display: "grid", gap: "6px" }}>
                    <label style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      {...registerCreate("quantity")}
                      style={createFieldStyle(!!createErrors.quantity)}
                      disabled={isCreateSubmitting}
                    />
                    <p
                      className={createErrors.quantity ? "text-sm text-red-600" : "text-sm text-transparent"}
                      style={{ margin: 0, minHeight: "20px" }}
                    >
                      {createErrors.quantity?.message ?? " "}
                    </p>
                  </div>

                  <div style={{ display: "grid", gap: "6px" }}>
                    <label style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>
                      Alert Threshold
                    </label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      {...registerCreate("alertThreshold")}
                      style={createFieldStyle(!!createErrors.alertThreshold)}
                      disabled={isCreateSubmitting}
                    />
                    <p
                      className={createErrors.alertThreshold ? "text-sm text-red-600" : "text-sm text-transparent"}
                      style={{ margin: 0, minHeight: "20px" }}
                    >
                      {createErrors.alertThreshold?.message ?? " "}
                    </p>
                  </div>
                </div>
              </div>

              {createSubmitError && (
                <div
                  style={{
                    margin: "0 20px 16px",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                    backgroundColor: "#fef2f2",
                    color: "#b91c1c",
                    fontSize: "13px",
                  }}
                >
                  {createSubmitError}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4" style={{ flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  disabled={isCreateSubmitting}
                  style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #dee2e6", backgroundColor: "white", color: "#374151", fontSize: "14px", cursor: isCreateSubmitting ? "not-allowed" : "pointer" }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isCreateSubmitting || isCreateLoadingProducts}
                  style={{ padding: "8px 14px", borderRadius: "8px", border: "none", backgroundColor: "#8B4513", color: "white", fontSize: "14px", fontWeight: 600, cursor: isCreateSubmitting || isCreateLoadingProducts ? "not-allowed" : "pointer", opacity: isCreateSubmitting || isCreateLoadingProducts ? 0.6 : 1 }}
                >
                  {isCreateSubmitting ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {restoreModal.open && (
        <div onClick={() => setRestoreModal({ open: false, inventoryId: "", productName: "" })} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", width: "min(480px, calc(100vw - 24px))", maxHeight: "calc(100dvh - 24px)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ backgroundColor: "#d4edda", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#28a745" }}>restore</span></div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#212529" }}>Restore Inventory</h2>
              </div>
              <button onClick={() => setRestoreModal({ open: false, inventoryId: "", productName: "" })} style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "#6c757d" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ margin: "0 0 16px", fontSize: "15px", color: "#495057", lineHeight: "1.6" }}>Are you sure you want to restore this inventory item?</p>
              <div style={{ backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                <div style={{ marginBottom: "8px" }}><span style={{ fontSize: "12px", color: "#6c757d", textTransform: "uppercase", fontWeight: "600" }}>Inventory ID</span><p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#212529", fontWeight: "500" }}>#{restoreModal.inventoryId.slice(-6)}</p></div>
                <div><span style={{ fontSize: "12px", color: "#6c757d", textTransform: "uppercase", fontWeight: "600" }}>Product</span><p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#212529", fontWeight: "500" }}>{restoreModal.productName}</p></div>
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setRestoreModal({ open: false, inventoryId: "", productName: "" })} disabled={isRestoring} style={{ padding: "10px 20px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", backgroundColor: "white", color: "#374151" }}>Cancel</button>
              <button onClick={handleRestoreConfirm} disabled={isRestoring} style={{ padding: "10px 20px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: isRestoring ? "not-allowed" : "pointer", backgroundColor: "#28a745", color: "white", opacity: isRestoring ? 0.7 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{isRestoring ? "sync" : "restore"}</span>{isRestoring ? "Restoring..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes inventorySpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
