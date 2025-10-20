import { z } from "zod";

const decimalSchema = z
  .union([z.string(), z.number()])
  .transform((val) => parseFloat(val.toString()))
  .refine((val) => !isNaN(val), {
    message: "Must be a valid decimal number",
  });

export const validateBranchCreate = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .max(100, { message: "Name must be at most 100 characters" }),
  igis_branch_code: z
    .string({
      required_error: "IGIS Branch Code is required",
      invalid_type_error: "IGIS Branch Code must be a string",
    })
    .max(8, {
      message: "IGIS Branch Code must be at most 8 characters",
    })
    .min(8, {
      message: "IGIS Branch Code must be at least 8 characters",
    }),
  igis_takaful_code: z
    .string({
      required_error: "IGIS Takaful Code is required",
      invalid_type_error: "IGIS Takaful Code must be a string",
    })
    .max(8, {
      message: "IGIS Takaful Code must be at most 8 characters",
    })
    .min(8, {
      message: "IGIS Takaful Code must be at least 8 characters",
    }),
  address: z
    .string({
      required_error: "Address is required",
      invalid_type_error: "Address must be a string",
    })
    .max(200, { message: "Address must be at most 200 characters" }),
  phone: z
    .string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number must be a string",
    })
    .trim()
    .startsWith("03")
    .min(11, {
      message: "Phone number must be at least 11 characters i.e: 03000000000",
    })
    .max(11, {
      message: "Phone number must be at most 11 characters i.e: 03000000000",
    }),
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({ message: "Invalid email address" })
    .trim()
    .max(100, { message: "Email must be at most 100 characters" }),
  website: z
    .string({
      required_error: "Website is required",
      invalid_type_error: "Website must be a string",
    })
    .url({ message: "Invalid website URL" })
    .trim()
    .max(100),
  his_code: z
    .string({
      required_error: "HIS Code is required",
      invalid_type_error: "HIS Code must be a string",
    })
    .max(10, { message: "HIS Code must be at most 10 characters" })
    .min(10, {
      message: "HIS Code must be at least 10 characters",
    }),
  his_code_takaful: z
    .string({
      required_error: "HIS Takaful Code is required",
      invalid_type_error: "HIS Takaful Code must be a string",
    })
    .max(10, { message: "HIS Takaful Code must be at most 10 characters" })
    .min(10, {
      message: "HIS Takaful Code must be at least 10 characters",
    }),
  sales_tax_perc: decimalSchema.refine((val) => val >= 0 && val <= 999.99, {
    message: "Must be a valid decimal (up to 999.99)",
  }),
  fed_insurance_fee: decimalSchema.refine((val) => val >= 0 && val <= 999.99, {
    message: "Must be a valid decimal (up to 999.99)",
  }),
  stamp_duty: z
    .number({
      required_error: "Stamp Duty is required",
      invalid_type_error: "Stamp Duty must be a number",
    })
    .int({
      message: "Stamp Duty must be an integer",
    }),
  admin_rate: decimalSchema.refine((val) => val >= 0 && val <= 999.99, {
    message: "Must be a valid decimal (up to 999.99)",
  }),
});

export const validateBranchUpdate = validateBranchCreate.extend({
  branch_id: z
    .number({
      required_error: "Branch ID is required",
      invalid_type_error: "Branch ID must be a number",
    })
    .int({
      message: "Branch ID must be an integer",
    }),
});

export const validateBranchListing = z.object({
  date: z
    .string({
      invalid_type_error: "Date range must be a string.",
    })
    .regex(
      /^\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}$/,
      "Date must be in format 'YYYY-MM-DD to YYYY-MM-DD'."
    )
    .optional()
    .nullable(),
});

export type BranchType = z.infer<typeof validateBranchCreate>;
export type BranchUpdateType = z.infer<typeof validateBranchUpdate>;
export type BranchListingType = z.infer<typeof validateBranchListing>;
