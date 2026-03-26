import { z } from "zod";
import type {
  Product,
  ProductCreatePayload,
} from "../../../../types/product.types";

export const buildPriceSchema = (label: string) =>
  z
    .union([
      z.string().trim().min(1, `${label} is required`),
      z.number(),
    ])
    .transform((value, ctx) => {
      const nextValue =
        typeof value === "string" ? value.trim() : value;

      if (typeof nextValue === "string") {
        if (!/^-?\d+(\.\d+)?$/.test(nextValue)) {
          ctx.addIssue({
            code: "custom",
            message: `${label} must be an integer`,
          });
          return z.NEVER;
        }

        const parsedValue = Number(nextValue);
        if (!Number.isInteger(parsedValue)) {
          ctx.addIssue({
            code: "custom",
            message: `${label} must be an integer`,
          });
          return z.NEVER;
        }

        if (parsedValue <= 0) {
          ctx.addIssue({
            code: "custom",
            message: `${label} must be greater than 0`,
          });
          return z.NEVER;
        }

        if (parsedValue < 1000 || parsedValue > 100000) {
          ctx.addIssue({
            code: "custom",
            message: `${label} must be between 1,000 and 100,000`,
          });
          return z.NEVER;
        }

        return parsedValue;
      }

      if (!Number.isInteger(nextValue)) {
        ctx.addIssue({
          code: "custom",
          message: `${label} must be an integer`,
        });
        return z.NEVER;
      }

      if (nextValue <= 0) {
        ctx.addIssue({
          code: "custom",
          message: `${label} must be greater than 0`,
        });
        return z.NEVER;
      }

      if (nextValue < 1000 || nextValue > 100000) {
        ctx.addIssue({
          code: "custom",
          message: `${label} must be between 1,000 and 100,000`,
        });
        return z.NEVER;
      }

      return nextValue;
    });

export const productSchema = z
  .object({
    SKU: z.string().trim().min(1, "SKU is required"),
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().min(1, "Description is required"),
    content: z.string().trim().min(1, "Content is required"),
    image_url: z
      .string()
      .trim()
      .min(1, "Main image is required")
      .url("Main image must be a valid URL"),
    images_url: z
      .array(
        z.string().trim().url("Each additional image must be a valid URL"),
      )
      .default([]),
    min_price: buildPriceSchema("Min price"),
    max_price: buildPriceSchema("Max price"),
    is_have_topping: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.max_price <= data.min_price) {
      ctx.addIssue({
        code: "custom",
        path: ["max_price"],
        message: "Max price must be greater than min price",
      });
    }
  });

export const productFormSchema = productSchema;

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.output<typeof productSchema>;

export const DEFAULT_PRODUCT_FORM_VALUES: ProductFormInput = {
  SKU: "",
  name: "",
  description: "",
  content: "",
  image_url: "",
  images_url: [],
  min_price: "",
  max_price: "",
  is_have_topping: false,
};

export const getProductFormDefaultValues = (
  product?: Partial<Product> | null,
): ProductFormInput => ({
  SKU: product?.SKU ?? "",
  name: product?.name ?? "",
  description: product?.description ?? "",
  content: product?.content ?? "",
  image_url: product?.image_url ?? "",
  images_url: product?.images_url ?? [],
  min_price:
    product?.min_price !== undefined && product?.min_price !== null
      ? String(product.min_price)
      : "",
  max_price:
    product?.max_price !== undefined && product?.max_price !== null
      ? String(product.max_price)
      : "",
  is_have_topping: Boolean(product?.is_have_topping),
});

export const toProductPayload = (
  values: ProductFormValues,
): ProductCreatePayload => ({
  SKU: values.SKU.trim(),
  name: values.name.trim(),
  description: values.description.trim(),
  content: values.content,
  image_url: values.image_url.trim(),
  images_url: values.images_url ?? [],
  min_price: values.min_price,
  max_price: values.max_price,
  is_have_topping: values.is_have_topping ?? false,
});
