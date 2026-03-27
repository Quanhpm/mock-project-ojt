import { z } from "zod";

export const franchiseFormSchema = z
  .object({
    code: z.string().min(1, "Franchise code is required"),
    name: z.string().min(1, "Franchise name is required"),
    hotline: z
      .string()
      .min(1, "Hotline is required")
      .length(10, "Hotline must be exactly 10 digits")
      .regex(/^\d+$/, "Hotline must contain only digits"),
    logo_url: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    opened_at: z.string().min(1, "Opening time is required"),
    closed_at: z.string().nullable().optional(),
    google_map_script: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.opened_at && data.closed_at && data.opened_at >= data.closed_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Opened time must be before closed time",
        path: ["opened_at"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Closed time must be after opened time",
        path: ["closed_at"],
      });
    }
  });

export type FranchiseFormValues = z.infer<typeof franchiseFormSchema>;

export const DEFAULT_FRANCHISE_FORM_VALUES: FranchiseFormValues = {
  code: "",
  name: "",
  hotline: "",
  logo_url: "",
  address: "",
  opened_at: "",
  closed_at: "",
  google_map_script: "",
  is_active: true,
};
