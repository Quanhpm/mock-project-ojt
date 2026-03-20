import { z } from "zod";
import type { ImportValidationError } from "./inventory.types";

type EditableField = "_editQuantity" | "_editAlertThreshold";
type ImportField = "quantity" | "alert_threshold";

const createEditableNumberSchema = (label: string) =>
  z
    .any()
    .refine(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        typeof value !== "boolean" &&
        !Number.isNaN(Number(value)),
      `${label} phải là số`,
    )
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value), `${label} phải là số nguyên`)
    .refine((value) => value >= 0, `${label} phải >= 0`);

export const inventoryEditableRowSchema = z
  .object({
    _editQuantity: createEditableNumberSchema("Quantity"),
    _editAlertThreshold: createEditableNumberSchema("Alert Threshold"),
  })
  .passthrough();

export const inventoryTableFormSchema = z.object({
  items: z.array(inventoryEditableRowSchema),
});

export const inventoryImportRowSchema = z.object({
  quantity: createEditableNumberSchema("Quantity"),
  alert_threshold: createEditableNumberSchema("Alert Threshold"),
});

export const getInventoryTableFieldPath = (
  index: number,
  field: EditableField,
) => `items.${index}.${field}` as const;

export const getInventoryImportFieldPath = (
  index: number,
  field: ImportField,
) =>
  getInventoryTableFieldPath(
    index,
    field === "quantity" ? "_editQuantity" : "_editAlertThreshold",
  );

export function validateImportEditableFields(
  row: Record<string, unknown>,
  rowIndex: number,
): ImportValidationError[] {
  const result = inventoryImportRowSchema.safeParse(row);
  if (result.success) return [];

  const errors: ImportValidationError[] = [];
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === "quantity" || field === "alert_threshold") {
      errors.push({
        row: rowIndex + 1,
        field,
        message: `Row ${String(rowIndex + 1).padStart(2, "0")}: ${issue.message}`,
      });
    }
  }

  return errors;
}
