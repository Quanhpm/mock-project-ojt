import { z } from "zod";

const createSelectFieldSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Please select a ${label}.`);

const DECIMAL_SEPARATOR_PATTERN = /[.,]/;
const INTEGER_PATTERN = /^-?\d+$/;

const createPositiveIntegerFieldSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => !DECIMAL_SEPARATOR_PATTERN.test(value), "Must be an integer.")
    .refine((value) => INTEGER_PATTERN.test(value), `${label} must be a valid number.`)
    .transform(Number)
    .refine((value) => value > 0, "Must be greater than 0.");

export const inventoryCreateFormSchema = z.object({
  franchiseId: createSelectFieldSchema("franchise"),
  productFranchiseId: createSelectFieldSchema("product"),
  quantity: createPositiveIntegerFieldSchema("Quantity"),
  alertThreshold: createPositiveIntegerFieldSchema("Alert Threshold"),
});

export type InventoryCreateFormInput = z.input<typeof inventoryCreateFormSchema>;
export type InventoryCreateFormValues = z.output<typeof inventoryCreateFormSchema>;

export const inventoryCreateDefaultValues: InventoryCreateFormInput = {
  franchiseId: "",
  productFranchiseId: "",
  quantity: "",
  alertThreshold: "",
};
