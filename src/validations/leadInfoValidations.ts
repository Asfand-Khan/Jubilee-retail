import { z } from "zod";

export const LeadStatusEnum = z.enum(
  [
    "pending",
    "waiting",
    "interested",
    "not_interested",
    "callback_scheduled",
    "cancelled",
  ],
  {
    required_error: "Status is required",
  }
);

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in the format YYYY-MM-DD")
  .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid date value")
  .optional()
  .or(z.literal("").transform(() => undefined));

const phoneNumber = z
  .string()
  .regex(
    /^03[0-9]{9}$/,
    "Mobile number must start with 03 and be exactly 11 digits"
  )
  .optional();

const email = z.string().email("Invalid email address format").optional();

export const validateLeadInfoSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  dob: dateString,
  age: z
    .number()
    .int("Age must be an integer")
    .min(0, "Age cannot be negative")
    .max(120, "Age cannot exceed 120")
    .optional(),
  mobile_num: phoneNumber,
  email_address: email,
  spouse_dob: dateString,
  spouse_age: z
    .number()
    .int("Spouse age must be an integer")
    .min(0, "Spouse age cannot be negative")
    .max(120, "Spouse age cannot exceed 120")
    .optional(),
  kids: z
    .number()
    .int("Kids count must be an integer")
    .min(0, "Kids cannot be negative")
    .max(20, "Kids cannot exceed 20")
    .optional(),
  family_kid1_dob: dateString,
  family_kid2_dob: dateString,
  family_kid3_dob: dateString,
  family_kid4_dob: dateString,
  product_type: z
    .string()
    .max(255, "Product type cannot exceed 255 characters")
    .optional(),
  product_data: z
    .string()
    .max(255, "Product data cannot exceed 255 characters")
    .optional(),
  product_sku: z
    .string()
    .max(255, "Product SKU cannot exceed 255 characters")
    .optional(),
  travel_from: z.string().max(255).optional(),
  travel_to: z.string().max(255).optional(),
  travel_go: z.string().max(100).optional(),
  travel_with: z.string().max(100).optional(),
  travel_country: z.string().max(255).optional(),
  from_date: dateString,
  end_date: dateString,
  duration: z
    .number()
    .int("Duration must be an integer")
    .min(1, "Duration must be at least 1 day")
    .max(3650, "Duration cannot exceed 10 years")
    .optional(),
  insure_against: z.string().max(255).optional(),
  insure_house: z.string().max(255).optional(),
  insure_for: z.string().max(255).optional(),
  insure_live: z.string().max(255).optional(),
  insure_my: z.string().max(255).optional(),
  insure_area: z.string().max(255).optional(),
  insure_live_in: z.string().max(255).optional(),
  parent_insurance: z.string().max(255).optional(),
  parents_or_inlaw: z.string().max(100).optional(),
  parents_mother_dob: dateString,
  parents_father_dob: dateString,
});

export const validateLeadInfoUpdateSchema = z.object({
  lead_info_id: z
    .number({ required_error: "Lead Info ID is required" })
    .int({ message: "Lead Info ID must be an integer" }),
  status: LeadStatusEnum,
});

export const validateLeadInfoListing = z.object({
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

export type LeadInfoType = z.infer<typeof validateLeadInfoSchema>;
export type LeadInfoUpdateType = z.infer<typeof validateLeadInfoUpdateSchema>;
export type LeadInfoListingType = z.infer<typeof validateLeadInfoListing>;