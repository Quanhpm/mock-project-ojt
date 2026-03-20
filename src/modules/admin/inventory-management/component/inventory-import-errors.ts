import type { ImportValidationError, InventoryTableRow } from "./inventory.types";

interface MapInventoryImportErrorsParams {
  errors: ImportValidationError[];
  mappedRows: Record<string, unknown>[];
  currentItems: InventoryTableRow[];
  currentPage: number;
  itemsPerPage: number;
}

const formatRowNumber = (value: number) => String(value).padStart(2, "0");

const stripLegacyRowPrefix = (message: string) =>
  message.replace(/^Row \d{2}:\s*/, "");

export const getInventoryTableDisplayIndex = (
  currentPage: number,
  itemsPerPage: number,
  rowIndex: number,
) => (currentPage - 1) * itemsPerPage + rowIndex + 1;

export function mapInventoryImportErrorsToTableRows({
  errors,
  mappedRows,
  currentItems,
  currentPage,
  itemsPerPage,
}: MapInventoryImportErrorsParams): ImportValidationError[] {
  const tableRowIndexByProductFranchiseId = new Map<string, number>(
    currentItems.map((item, rowIndex) => [
      String(item.product_franchise_id).trim(),
      getInventoryTableDisplayIndex(currentPage, itemsPerPage, rowIndex),
    ]),
  );

  return errors.map((error) => {
    const mappedRow = mappedRows[error.row - 1];
    const productFranchiseId =
      typeof mappedRow?.product_franchise_id === "string"
        ? mappedRow.product_franchise_id.trim()
        : "";
    const tableRowIndex = productFranchiseId
      ? tableRowIndexByProductFranchiseId.get(productFranchiseId)
      : undefined;
    const baseMessage = stripLegacyRowPrefix(error.message);

    return {
      ...error,
      tableRowIndex,
      message: tableRowIndex
        ? `Excel row ${formatRowNumber(error.row)} -> table row ${formatRowNumber(tableRowIndex)}: ${baseMessage}`
        : `Excel row ${formatRowNumber(error.row)}: ${baseMessage}`,
    };
  });
}
