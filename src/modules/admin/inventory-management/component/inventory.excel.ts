import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type {
    InventoryTableRow,
    InventoryExcelRow,
    ImportValidationError,
} from "./inventory.types";
import { FIELD_TO_HEADER_MAP, EXCEL_HEADER_MAP } from "./inventory.types";

// ============================================================
// Export — Xuất dữ liệu inventory ra file Excel
// ============================================================

/**
 * Export inventory data ra file .xlsx
 * @param data - Toàn bộ rows trong RHF form
 * @param mode - "all" = toàn bộ, "selected" = chỉ các row đã tick checkbox
 */
export function exportInventoryToExcel(
    data: InventoryTableRow[],
    mode: "all" | "selected",
): boolean {
    const rowsToExport =
        mode === "selected" ? data.filter((r) => r._selected) : data;

    if (rowsToExport.length === 0) {
        return false; // Caller sẽ hiển thị toast error
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

    const ws = XLSX.utils.json_to_sheet(excelData);
    ws["!cols"] = [
        { wch: 38 },             // Inventory ID
        { wch: 30 },             // Product Name
        { wch: 25 },             // Franchise Name
        { wch: 38, hidden: true }, // Product Franchise ID — ẨN để user không sửa
        { wch: 12 },             // Quantity
        { wch: 18 },             // Alert Threshold
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");

    // Dùng file-saver (saveAs) để đảm bảo file tải về có đúng đuôi .xlsx
    const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbOut], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fileName = `inventory_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, fileName);

    return true;
}


// ============================================================
// Parse — Đọc file Excel/CSV thành mảng JSON
// ============================================================

export interface ParsedImportResult {
    success: true;
    rows: Record<string, unknown>[];
}

export interface ParsedImportError {
    success: false;
    error: string;
}

/**
 * Parse file .xlsx/.xls/.csv thành mảng JSON đã map header.
 * Trim headers để chống dư khoảng trắng.
 */
export async function parseImportFile(
    file: File,
): Promise<ParsedImportResult | ParsedImportError> {
    // === Validate file type ===
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
        return {
            success: false,
            error: "Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)",
        };
    }

    // === Validate file size (max 5MB) ===
    if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: "File quá lớn (tối đa 5MB)" };
    }

    try {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const sheetName = wb.SheetNames[0];

        if (!sheetName) {
            return { success: false, error: "File không có sheet nào" };
        }

        const sheet = wb.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (!rawRows || rawRows.length === 0) {
            return { success: false, error: "File không có dữ liệu" };
        }

        // === Validate headers (BẮT BUỘC trim) ===
        const firstRow = rawRows[0];
        const rawHeaders = Object.keys(firstRow);
        const expectedHeaders = Object.keys(EXCEL_HEADER_MAP);

        const trimmedHeaders = rawHeaders.map((h) => h.trim());
        const missingHeaders = expectedHeaders.filter(
            (expected) => !trimmedHeaders.includes(expected),
        );

        if (missingHeaders.length > 0) {
            return {
                success: false,
                error: `Header file không đúng định dạng. Thiếu cột: ${missingHeaders.join(", ")}`,
            };
        }

        // === Map header → key bằng EXCEL_HEADER_MAP (với trim) ===
        const mappedRows: Record<string, unknown>[] = rawRows.map((rawRow) => {
            const mapped: Record<string, unknown> = {};
            for (const [header, value] of Object.entries(rawRow)) {
                const trimmedHeader = header.trim();
                const key = EXCEL_HEADER_MAP[trimmedHeader];
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
            error: "Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.",
        };
    }
}

// ============================================================
// Validate — Row-by-row validation (TRÁI → PHẢI)
// ============================================================

/**
 * Validate từng row import theo thứ tự: quantity (trái) → alert_threshold (phải).
 * Thu thập TẤT CẢ lỗi vào mảng, sau khi check xong mới quyết định.
 */
export function validateImportRows(
    rows: Record<string, unknown>[],
): ImportValidationError[] {
    const errors: ImportValidationError[] = [];

    rows.forEach((row, index) => {
        const rowNum = String(index + 1).padStart(2, "0"); // "01", "02", ...

        // === Check quantity (TRÁI - check trước) ===
        const qty = row.quantity;
        if (
            qty === undefined ||
            qty === null ||
            qty === "" ||
            typeof qty === "boolean" ||
            isNaN(Number(qty))
        ) {
            errors.push({
                row: index + 1,
                field: "quantity",
                message: `Row ${rowNum}, lỗi chỉ được nhập data số ở field quantity,`,
            });
        } else {
            const qtyNum = Number(qty);
            if (qtyNum < 0) {
                errors.push({
                    row: index + 1,
                    field: "quantity",
                    message: `Row ${rowNum}: lỗi data ở field quantity phải >= 0`,
                });
            } else if (!Number.isInteger(qtyNum)) {
                errors.push({
                    row: index + 1,
                    field: "quantity",
                    message: `Row ${rowNum}: lỗi data ở field quantity phải là số nguyên`,
                });
            }
        }

        // === Check alert_threshold (PHẢI - check sau) ===
        const threshold = row.alert_threshold;
        if (
            threshold === undefined ||
            threshold === null ||
            threshold === "" ||
            typeof threshold === "boolean" ||
            isNaN(Number(threshold))
        ) {
            errors.push({
                row: index + 1,
                field: "alert_threshold",
                message: `Row ${rowNum}, lỗi chỉ được nhập data số ở field alert_threshold,`,
            });
        } else {
            const thresholdNum = Number(threshold);
            if (thresholdNum < 0) {
                errors.push({
                    row: index + 1,
                    field: "alert_threshold",
                    message: `Row ${rowNum}: lỗi data ở field alert_threshold phải >= 0`,
                });
            } else if (!Number.isInteger(thresholdNum)) {
                errors.push({
                    row: index + 1,
                    field: "alert_threshold",
                    message: `Row ${rowNum}: lỗi data ở field alert_threshold phải là số nguyên`,
                });
            }
        }
    });

    return errors;
}

// ============================================================
// Map parsed Excel rows → InventoryExcelRow[]
// ============================================================

/**
 * Convert mapped JSON rows sang typed InventoryExcelRow[].
 * Chỉ gọi SAU KHI validate thành công (errors.length === 0).
 */
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
