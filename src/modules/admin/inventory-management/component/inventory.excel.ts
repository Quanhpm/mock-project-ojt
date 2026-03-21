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

export function validateImportRows(
    rows: Record<string, unknown>[],
): ImportValidationError[] {
    const errors: ImportValidationError[] = [];

    rows.forEach((row, index) => {
        errors.push(...validateImportEditableFields(row, index));
    });

    return errors;
}

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
