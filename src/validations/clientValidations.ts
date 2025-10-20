import { z } from "zod";

export const validateClient = z.object({
  name: z
    .string()
    .min(1, { message: "Client name is required" })
    .max(100, { message: "Client name must not exceed 100 characters" }),
  igis_client_code: z
    .string()
    .length(18, { message: "IGIS Client Code must be exactly 18 characters" }),
  address: z
    .string()
    .min(1, { message: "Address is required" })
    .max(200, { message: "Address must not exceed 200 characters" }),
  telephone: z
    .string({ required_error: "Phone number is required" })
    .max(15, { message: "Phone number should not exceed 15 characters" })
    .min(11, { message: "Phone number should be at least 11 characters" })
    .trim(),
  contact_person: z
    .string()
    .min(1, { message: "Contact person is required" })
    .max(100, {
      message: "Contact person name must not exceed 100 characters",
    }),
  branch_id: z
    .number({ required_error: "Branch ID is required" })
    .int({ message: "Branch ID must be an integer" }),
});

export const validateClientUpdate = validateClient.extend({
  client_id: z
    .number({
      required_error: "Client ID is required",
      invalid_type_error: "Client ID must be a number",
    })
    .int({
      message: "Client ID must be an integer",
    }),
});

export const validateClientListing = z.object({
  branch: z
    .array(
      z.number({
          invalid_type_error: "Branch ID must be a number",
        })
        .int({
          message: "Branch ID must be an integer",
        })
    )
    .optional()
    .nullable(),
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

export type ClientType = z.infer<typeof validateClient>;
export type ClientUpdateType = z.infer<typeof validateClientUpdate>;
export type ClientListingType = z.infer<typeof validateClientListing>;