import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const policyDetailItem = z.object({
  name: z.string().min(1, "Policy detail name is required"),
  type: z.string().min(1, "Policy detail type is required"),
  relation: z.string().min(1, "Policy detail relation is required"),
  cnic: z
    .string()
    .regex(/^\d{13}$/, "Policy detail CNIC must be 13 digits without dashes.")
    .optional()
    .nullable(),
  cnic_issue_date: z
    .string()
    .regex(
      dateRegex,
      "Policy detail cnic issue date must be in YYYY-MM-DD format."
    )
    .optional()
    .nullable(),
  dob: z
    .string()
    .regex(dateRegex, "Policy detail DOB must be in YYYY-MM-DD format.")
    .optional()
    .nullable(),
  gender: z.string().optional().nullable(),
});

const riderItem = z.object({
  name: z.string().min(1, "Rider name is required"),
  sum_insured: z.string().min(1, "Rider sum insured is required"),
});

export const bulkOrderSchema = z.array(z.object({
  api_user_name: z.string().min(1, "API User Name is required"),
  payment_mode_code: z.enum(["B2B"], {
    required_error: "Payment mode code is required.",
  }),
  child_sku: z.string().min(1, "Child SKU is required"),
  order_code: z.string().min(1, "Order code is required"),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_cnic: z
    .string()
    .regex(/^\d{13}$/, "Customer CNIC must be 13 digits without dashes."),
  customer_dob: z
    .string()
    .regex(dateRegex, "Customer DOB must be in YYYY-MM-DD format."),
  customer_email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required"),
  cnic_issue_date: z
    .string()
    .regex(dateRegex, "Customer DOB must be in YYYY-MM-DD format.")
    .optional()
    .nullable(),
  customer_contact: z.string().min(1, "Customer contact is required"),
  customer_address: z.string().min(1, "Customer address is required"),
  customer_gender: z.enum(["male", "female", "others"], {
    required_error: "Customer gender is required.",
  }),
  customer_occupation: z.string().min(1, "Customer occupation is required"),
  start_date: z
    .string()
    .regex(dateRegex, "Start Date must be in YYYY-MM-DD format."),
  expiry_date: z
    .string()
    .regex(dateRegex, "Expiry Date must be in YYYY-MM-DD format."),
  issue_date: z
    .string()
    .regex(dateRegex, "Issue Date must be in YYYY-MM-DD format."),
  received_premium: z.string().min(1, "Received premium is required"),
  policy_detail: z.array(policyDetailItem),
  rider: z.array(riderItem).default([]),
}));

export type BulkOrder = z.infer<typeof bulkOrderSchema>;
