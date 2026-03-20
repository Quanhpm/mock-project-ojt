import { useState, useRef, useCallback } from "react";
import type { UseFormGetValues, UseFieldArrayReplace } from "react-hook-form";
import type {
    InventoryTableRow,
    ImportValidationError,
} from "../inventory.types";
import {
    exportInventoryToExcel,
    parseImportFile,
    validateImportRows,
} from "../inventory.excel";
import { useToast } from "@/hooks/use-toast.hook";

interface UseInventoryExcelParams {
    getValues: UseFormGetValues<{ items: InventoryTableRow[] }>;
    replace: UseFieldArrayReplace<{ items: InventoryTableRow[] }, "items">;
    onImportValidationErrors?: (
        errors: ImportValidationError[],
        mappedRows: Record<string, unknown>[],
    ) => void;
    onImportSuccess?: () => void;
    onImportStart?: () => void;
}

interface UseInventoryExcelReturn {
    // Export
    handleExportAll: () => void;
    handleExportSelected: () => void;

    // Import
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleImportClick: () => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isParsingFile: boolean;

    // Import Errors
    importErrors: ImportValidationError[];
    setImportErrors: React.Dispatch<
        React.SetStateAction<ImportValidationError[]>
    >;
}

export function useInventoryExcel({
    getValues,
    replace,
    onImportValidationErrors,
    onImportSuccess,
    onImportStart,
}: UseInventoryExcelParams): UseInventoryExcelReturn {
    const [importErrors, setImportErrors] = useState<ImportValidationError[]>([]);
    const [isParsingFile, setIsParsingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

    // === Export All ===
    const handleExportAll = useCallback(() => {
        const items = getValues("items");
        const exported = exportInventoryToExcel(items, "all");
        if (!exported) {
            toastError("Export thất bại", "Không có dữ liệu để export");
        } else {
            toastSuccess("Export thành công", `Đã xuất ${items.length} dòng ra file Excel`);
        }
    }, [getValues, toastError, toastSuccess]);

    // === Export Selected ===
    const handleExportSelected = useCallback(() => {
        const items = getValues("items");
        const selectedCount = items.filter((r) => r._selected).length;
        const exported = exportInventoryToExcel(items, "selected");
        if (!exported) {
            toastError("Export thất bại", "Vui lòng chọn ít nhất 1 row để export");
        } else {
            toastSuccess("Export thành công", `Đã xuất ${selectedCount} dòng ra file Excel`);
        }
    }, [getValues, toastError, toastSuccess]);

    // === Import Click (mở file dialog) ===
    const handleImportClick = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset input để cho phép chọn lại cùng file
            fileInputRef.current.click();
        }
    }, []);

    // === Import File Change ===
    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setIsParsingFile(true);
            setImportErrors([]); // Xóa lỗi cũ
            onImportStart?.();

            try {
                // Step 1: Parse file
                const parseResult = await parseImportFile(file);

                if (!parseResult.success) {
                    toastError("Import thất bại", parseResult.error);
                    setIsParsingFile(false);
                    return;
                }

                const mappedRows = parseResult.rows;

                // Step 2: Validate từng row (trái → phải: quantity trước, alert_threshold sau)
                const errors = validateImportRows(mappedRows);

                // Step 2.5: Check product_franchise_id có tồn tại & kiểm tra trùng lặp
                const currentItems = getValues("items");
                const pfIdSet = new Set(currentItems.map((item) => item.product_franchise_id));
                const seenPfIds = new Map<string, number[]>();

                mappedRows.forEach((row, index) => {
                    const rowNum = String(index + 1).padStart(2, "0");
                    const pfId = row.product_franchise_id;

                    // Check product_franchise_id tồn tại trong Excel
                    if (!pfId || typeof pfId !== "string" || String(pfId).trim() === "") {
                        errors.push({
                            row: index + 1,
                            field: "product_franchise_id",
                            message: `Row ${rowNum}: thiếu Product Franchise ID (file có thể đã bị chỉnh sửa)`,
                        });
                        return;
                    }

                    const pfIdStr = String(pfId).trim();

                    // Check product_franchise_id có match với table không
                    if (!pfIdSet.has(pfIdStr)) {
                        errors.push({
                            row: index + 1,
                            field: "product_franchise_id",
                            message: `Row ${rowNum}: Product Franchise ID "${pfIdStr.slice(-8)}" không tìm thấy trên bảng hiện tại`,
                        });
                    }

                    // Thu thập để check trùng lặp
                    if (!seenPfIds.has(pfIdStr)) {
                        seenPfIds.set(pfIdStr, []);
                    }
                    seenPfIds.get(pfIdStr)!.push(index + 1);
                });

                // Check trùng lặp product_franchise_id
                seenPfIds.forEach((rows, pfId) => {
                    if (rows.length > 1) {
                        errors.push({
                            row: rows[0],
                            field: "product_franchise_id",
                            message: `Trùng lặp Product Franchise ID "${pfId.slice(-8)}" tại các dòng: ${rows.map((r) => String(r).padStart(2, "0")).join(", ")}`,
                        });
                    }
                });

                // Step 3: Xử lý kết quả
                if (errors.length > 0) {
                    // ❌ CÓ LỖI → KHÔNG import, hiển thị lỗi trên Error Banner
                    setImportErrors(errors);
                    onImportValidationErrors?.(errors, mappedRows);
                    setIsParsingFile(false);
                    return;
                }

                // ✅ KHÔNG LỖI → Import data vào form + auto tick checkbox
                setImportErrors([]);
                onImportSuccess?.();

                const updatedItems = currentItems.map((item) => ({ ...item }));

                // Match bằng product_franchise_id thay vì index
                let matchedCount = 0;
                let skippedCount = 0;

                for (const importedRow of mappedRows) {
                    const pfId = String(importedRow.product_franchise_id).trim();

                    // Tìm row trong table có cùng product_franchise_id
                    const targetIndex = updatedItems.findIndex(
                        (item) => item.product_franchise_id === pfId,
                    );

                    if (targetIndex === -1) {
                        skippedCount++;
                        continue;
                    }

                    updatedItems[targetIndex] = {
                        ...updatedItems[targetIndex],
                        _editQuantity: Number(importedRow.quantity),
                        _editAlertThreshold: Number(importedRow.alert_threshold),
                        _selected: true, // ← AUTO TICK CHECKBOX
                    };
                    matchedCount++;
                }

                replace(updatedItems); // Cập nhật lại form array

                if (skippedCount > 0) {
                    toastWarning(
                        "Import hoàn tất (có cảnh báo)",
                        `Đã import ${matchedCount} dòng, bỏ qua ${skippedCount} dòng không khớp.`,
                    );
                } else {
                    toastSuccess(
                        "Import thành công",
                        `Đã import ${matchedCount} dòng vào bảng`,
                    );
                }
            } catch {
                toastError(
                    "Import thất bại",
                    "Lỗi không xác định khi import file",
                );
            } finally {
                setIsParsingFile(false);
            }
        },
        [
            getValues,
            onImportStart,
            onImportSuccess,
            onImportValidationErrors,
            replace,
            toastError,
            toastSuccess,
            toastWarning,
        ],
    );

    return {
        handleExportAll,
        handleExportSelected,
        fileInputRef,
        handleImportClick,
        handleFileChange,
        isParsingFile,
        importErrors,
        setImportErrors,
    };
}
