import { z } from "zod";

export const validatePlanCreate = z.object({
  name: z
    .string({
      required_error: "Plan name is required",
      invalid_type_error: "Plan name must be a string",
    })
    .min(1, { message: "Plan name is required" })
    .max(100, { message: "Plan name must be at most 100 characters" }),
});

export const validatePlanUpdate = validatePlanCreate.extend({
  plan_id: z
    .number({
      required_error: "Plan ID is required",
      invalid_type_error: "Plan ID must be a number",
    })
    .int({
      message: "Plan ID must be an integer",
    }),
});

export type PlanType = z.infer<typeof validatePlanCreate>;
export type PlanUpdateType = z.infer<typeof validatePlanUpdate>;
