import { z } from "zod";

export const validateIgisSubMake = z.object({
  make_id: z
    .number({
      required_error: "Make ID is required.",
      invalid_type_error: "Make ID must be a number.",
    })
    .int("Make ID must be an integer."),

  sub_make_name: z
    .string({
      required_error: "Sub make name is required.",
      invalid_type_error: "Sub make name must be a string.",
    })
    .min(3, "Sub make name cannot be less than 3 characters.")
    .max(100, "Sub make name must not exceed 100 characters."),

  igis_sub_make_code: z
    .string({
      required_error: "IGIS sub make code is required.",
      invalid_type_error: "IGIS sub make code must be a string.",
    })
    .length(4, "IGIS sub make code must be exactly 4 characters."),

  seating_capacity: z
    .number({
      invalid_type_error: "Seating capacity must be a number.",
    })
    .int("Seating capacity must be an integer.")
    .positive("Seating capacity must be positive.")
    .optional(),

  cubic_capacity: z
    .string({
      invalid_type_error: "Cubic capacity must be a string.",
    })
    .refine((val) => !isNaN(parseFloat(val)), "Cubic capacity must be a number.")
    .optional(),

  coi_type_code: z
    .string({
      invalid_type_error: "COI type code must be a string.",
    })
    .max(50, "COI type code must not exceed 50 characters.")
    .optional(),
});

export const validateIgisSubMakeUpdate = validateIgisSubMake.extend({
  sub_make_id: z
    .number({
      required_error: "Sub make ID is required.",
      invalid_type_error: "Sub make ID must be a number.",
    })
    .int("Sub make ID must be an integer."),
});

export type IgisSubMakeType = z.infer<typeof validateIgisSubMake>;
export type IgisSubMakeUpdateType = z.infer<typeof validateIgisSubMakeUpdate>;