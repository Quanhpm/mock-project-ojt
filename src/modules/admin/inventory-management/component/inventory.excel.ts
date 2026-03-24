import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type {
  InventoryTableRow,
  InventoryExcelRow,
  ImportValidationError,
} from "./inventory.types";
import { FIELD_TO_HEADER_MAP, EXCEL_HEADER_MAP } from "./inventory.types";
import { validateImportEditableFields } from "./inventory-table.validation";

export function exportInventoryToExcel(
  data: InventoryTableRow[],
  mode: "all" | "selected",
): boolean {
  const rowsToExport =
    mode === "selected" ? data.filter((row) => row._selected) : data;

  if (rowsToExport.length === 0) {
    return false;
  }

  const excelData = rowsToExport.map((row) => ({
    [FIELD_TO_HEADER_MAP.id]: row.id,
    [FIELD_TO_HEADER_MAP.product_name]: row.product_name ?? row.product_id,
    [FIELD_TO_HEADER_MAP.franchise_name]:
      row.franchise_name ?? row.franchise_id,
    [FIELD_TO_HEADER_MAP.product_franchise_id]: row.product_franchise_id,
    [FIELD_TO_HEADER_MAP.quantity]: row._editQuantity,
    [FIELD_TO_HEADER_MAP.alert_threshold]: row._editAlertThreshold,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet["!cols"] = [
    { wch: 38 },
    { wch: 30 },
    { wch: 25 },
    { wch: 38, hidden: true },
    { wch: 12 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

  const workbookBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([workbookBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const fileName = `inventory_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, fileName);

  return true;
}

export interface ParsedImportResult {
  success: true;
  rows: Record<string, unknown>[];
}

export interface ParsedImportError {
  success: false;
  error: string;
}

export async function parseImportFile(
  file: File,
): Promise<ParsedImportResult | ParsedImportError> {
  const validExtensions = [".xlsx", ".xls", ".csv"];
  const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  if (!validExtensions.includes(ext)) {
    return {
      success: false,
      error: "Only Excel (.xlsx, .xls) or CSV (.csv) files are supported.",
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "The file is too large. Maximum size is 5 MB." };
  }

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return { success: false, error: "The file does not contain any worksheet." };
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (!rawRows || rawRows.length === 0) {
      return { success: false, error: "The file does not contain any data." };
    }

    const firstRow = rawRows[0];
    const rawHeaders = Object.keys(firstRow);
    const expectedHeaders = Object.keys(EXCEL_HEADER_MAP);
    const trimmedHeaders = rawHeaders.map((header) => header.trim());
    const missingHeaders = expectedHeaders.filter(
      (expected) => !trimmedHeaders.includes(expected),
    );

    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: `Invalid file format. Missing columns: ${missingHeaders.join(", ")}`,
      };
    }

    const mappedRows: Record<string, unknown>[] = rawRows.map((rawRow) => {
      const mapped: Record<string, unknown> = {};
      for (const [header, value] of Object.entries(rawRow)) {
        const key = EXCEL_HEADER_MAP[header.trim()];
        if (key) {
          mapped[key] = value;
        }
      }
      return mapped;
    });

    return { success: true, rows: mappedRows };
  } catch {
    return {
      success: false,
      error: "Unable to read the file. Please check the file format and try again.",
    };
  }
}

export function validateImportRows(
  rows: Record<string, unknown>[],
): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  rows.forEach((row, index) => {
    errors.push(...validateImportEditableFields(row, index));
  });

  return errors;
}

export function mapToExcelRows(
  rows: Record<string, unknown>[],
): InventoryExcelRow[] {
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    product_name: String(row.product_name ?? ""),
    franchise_name: String(row.franchise_name ?? ""),
    product_franchise_id: String(row.product_franchise_id ?? ""),
    quantity: Number(row.quantity),
    alert_threshold: Number(row.alert_threshold),
  }));
}
