import { z } from "zod";

export const validateIgisMake = z.object({
  make_name: z
    .string({
      required_error: "Make name is required.",
      invalid_type_error: "Make name must be a string.",
    })
    .min(3, "Make name cannot be empty.")
    .max(100, "Make name must be at most 100 characters."),

  igis_make_code: z
    .string({
      required_error: "IGIS make code is required.",
      invalid_type_error: "IGIS make code must be a string.",
    })
    .length(4, "IGIS make code must be exactly 4 characters."),
});

export const validateIgisMakeUpdate = validateIgisMake.extend({
  make_id: z
    .number({
      required_error: "Make ID is required.",
      invalid_type_error: "Make ID must be a number.",
    })
    .int("Make ID must be an integer."),
});

export type IgisMakeType = z.infer<typeof validateIgisMake>;
export type IgisMakeUpdateType = z.infer<typeof validateIgisMakeUpdate>;
