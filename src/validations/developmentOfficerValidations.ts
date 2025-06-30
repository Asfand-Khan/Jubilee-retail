import { z } from "zod";

export const validateDevelopmentOfficer = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .max(100, { message: "Name must be at most 100 characters" }),

  branch_id: z
    .number({
      required_error: "Branch ID is required",
      invalid_type_error: "Branch ID must be a number",
    })
    .int({ message: "Branch ID must be an integer" }),

  igis_do_code: z
    .string({
      required_error: "IGIS DO Code is required",
      invalid_type_error: "IGIS DO Code must be a string",
    })
    .length(8, { message: "IGIS DO Code must be exactly 8 characters" }),

  igis_code: z
    .string({
      invalid_type_error: "IGIS Code must be a string",
    })
    .length(10, { message: "IGIS DO Code must be exactly 10 characters" })
    .optional()
    .nullable(),
});

export const validateDevelopmentOfficerUpdate = validateDevelopmentOfficer.extend({
  do_id: z
    .number({
      required_error: "Development Officer ID is required",
      invalid_type_error: "Development Officer ID must be a number",
    })
    .int({
      message: "Development Officer ID must be an integer",
    }),
});

export type DevelopmentOfficerType = z.infer<typeof validateDevelopmentOfficer>;
export type DevelopmentOfficerUpdateType = z.infer<typeof validateDevelopmentOfficerUpdate>;