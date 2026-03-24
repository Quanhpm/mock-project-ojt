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
  mapImportErrors?: (
    errors: ImportValidationError[],
    mappedRows: Record<string, unknown>[],
  ) => ImportValidationError[];
  onImportValidationErrors?: (
    errors: ImportValidationError[],
    mappedRows: Record<string, unknown>[],
  ) => void;
  onImportSuccess?: () => void;
  onImportStart?: () => void;
}

interface UseInventoryExcelReturn {
  handleExportAll: () => void;
  handleExportSelected: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImportClick: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isParsingFile: boolean;
  importErrors: ImportValidationError[];
  setImportErrors: React.Dispatch<React.SetStateAction<ImportValidationError[]>>;
}

export function useInventoryExcel({
  getValues,
  replace,
  mapImportErrors,
  onImportValidationErrors,
  onImportSuccess,
  onImportStart,
}: UseInventoryExcelParams): UseInventoryExcelReturn {
  const [importErrors, setImportErrors] = useState<ImportValidationError[]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    success: toastSuccess,
    error: toastError,
    warning: toastWarning,
  } = useToast();

  const handleExportAll = useCallback(() => {
    const items = getValues("items");
    const exported = exportInventoryToExcel(items, "all");

    if (!exported) {
      toastError("Export Failed", "No data is available to export.");
      return;
    }

    toastSuccess("Exported", `Exported ${items.length} rows to Excel.`);
  }, [getValues, toastError, toastSuccess]);

  const handleExportSelected = useCallback(() => {
    const items = getValues("items");
    const selectedCount = items.filter((item) => item._selected).length;
    const exported = exportInventoryToExcel(items, "selected");

    if (!exported) {
      toastError("Export Failed", "Please select at least one row to export.");
      return;
    }

    toastSuccess("Exported", `Exported ${selectedCount} rows to Excel.`);
  }, [getValues, toastError, toastSuccess]);

  const handleImportClick = useCallback(() => {
    if (!fileInputRef.current) return;

    fileInputRef.current.value = "";
    fileInputRef.current.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsParsingFile(true);
      setImportErrors([]);
      onImportStart?.();

      try {
        const parseResult = await parseImportFile(file);
        if (!parseResult.success) {
          toastError("Import Failed", parseResult.error);
          return;
        }

        const mappedRows = parseResult.rows;
        const errors = validateImportRows(mappedRows);
        const currentItems = getValues("items");
        const pfIdSet = new Set(currentItems.map((item) => item.product_franchise_id));
        const seenPfIds = new Map<string, number[]>();

        mappedRows.forEach((row, index) => {
          const rowNum = String(index + 1).padStart(2, "0");
          const pfId = row.product_franchise_id;

          if (!pfId || typeof pfId !== "string" || String(pfId).trim() === "") {
            errors.push({
              row: index + 1,
              field: "product_franchise_id",
              message: `Row ${rowNum}: Product Franchise ID is missing. The file may have been modified.`,
            });
            return;
          }

          const pfIdStr = String(pfId).trim();

          if (!pfIdSet.has(pfIdStr)) {
            errors.push({
              row: index + 1,
              field: "product_franchise_id",
              message: `Row ${rowNum}: Product Franchise ID "${pfIdStr.slice(-8)}" was not found in the current table.`,
            });
          }

          if (!seenPfIds.has(pfIdStr)) {
            seenPfIds.set(pfIdStr, []);
          }
          seenPfIds.get(pfIdStr)?.push(index + 1);
        });

        seenPfIds.forEach((rows, pfId) => {
          if (rows.length > 1) {
            errors.push({
              row: rows[0],
              field: "product_franchise_id",
              message: `Duplicate Product Franchise ID "${pfId.slice(-8)}" found at rows ${rows.map((row) => String(row).padStart(2, "0")).join(", ")}.`,
            });
          }
        });

        if (errors.length > 0) {
          const displayErrors = mapImportErrors
            ? mapImportErrors(errors, mappedRows)
            : errors;
          setImportErrors(displayErrors);
          onImportValidationErrors?.(errors, mappedRows);
          return;
        }

        setImportErrors([]);
        onImportSuccess?.();

        const updatedItems = currentItems.map((item) => ({ ...item }));
        let matchedCount = 0;
        let skippedCount = 0;

        for (const importedRow of mappedRows) {
          const pfId = String(importedRow.product_franchise_id).trim();
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
            _selected: true,
          };
          matchedCount++;
        }

        replace(updatedItems);

        if (skippedCount > 0) {
          toastWarning(
            "Import Completed",
            `Imported ${matchedCount} rows and skipped ${skippedCount} unmatched rows.`,
          );
          return;
        }

        toastSuccess("Imported", `Imported ${matchedCount} rows into the table.`);
      } catch {
        toastError("Import Failed", "An unexpected error occurred while importing the file.");
      } finally {
        setIsParsingFile(false);
      }
    },
    [
      getValues,
      mapImportErrors,
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
