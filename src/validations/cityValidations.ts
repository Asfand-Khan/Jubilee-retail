import { z } from "zod";

export const validateCity = z.object({
  country_id: z
    .number({ required_error: "Country is required." })
    .int("Country ID must be an integer.")
    .positive("Country ID must be a positive number."),

  igis_city_code: z
    .string()
    .max(50, "IGIS City Code must be at most 50 characters.")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  city_name: z
    .string({ required_error: "City name is required." })
    .min(2, "City name must be at least 2 characters.")
    .max(100, "City name must be at most 100 characters."),

  city_code: z
    .string({ required_error: "City code is required." })
    .min(2, "City code must be at least 2 characters.")
    .max(5, "City code must be at most 5 characters."),

  priority: z
    .number({ invalid_type_error: "Priority must be a number." })
    .int("Priority must be an integer.")
    .min(0, "Priority cannot be negative.")
    .default(0),

  is_tcs: z
    .boolean({ invalid_type_error: "is_tcs must be true or false." })
    .default(false),

  is_blueEx: z
    .boolean({ invalid_type_error: "is_blueEx must be true or false." })
    .default(false),

  is_leopard: z
    .boolean({ invalid_type_error: "is_leopard must be true or false." })
    .default(false),
});

export const validateCityUpdate = validateCity.extend({
  city_id: z
    .number({ required_error: "City ID is required." })
    .int("City ID must be an integer."),
});

export type CityType = z.infer<typeof validateCity>;
export type CityUpdateType = z.infer<typeof validateCityUpdate>;
