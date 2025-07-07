import { z } from "zod";

export const validateBusinessRegion = z.object({
  business_region_name: z
    .string({
      required_error: "Business region name is required.",
      invalid_type_error: "Business region name must be a string.",
    })
    .min(3, "Business region name cannot be empty.")
    .max(100, "Business region name must be at most 100 characters."),

  igis_business_region_code: z
    .string({
      required_error: "IGIS business region code is required.",
      invalid_type_error: "IGIS business region code must be a string.",
    })
    .length(4, "IGIS business region code must be exactly 4 characters."),
});

export const validateBusinessRegionUpdate = validateBusinessRegion.extend({
  business_region_id: z
    .number({
      required_error: "Business region ID is required.",
      invalid_type_error: "Business region ID must be a number.",
    })
    .int("Business region ID must be an integer."),
});

export type BusinessRegionType = z.infer<typeof validateBusinessRegion>;
export type BusinessRegionUpdateType = z.infer<typeof validateBusinessRegionUpdate>;
