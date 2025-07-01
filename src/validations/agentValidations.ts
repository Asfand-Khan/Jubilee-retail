import { z } from "zod";

export const validateAgent = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(3, { message: "Name must be at least 3 characters" })
    .max(100, { message: "Name must be at most 100 characters" }),
  igis_code: z
    .string({
      invalid_type_error: "IGIS Code must be a string",
    })
    .max(10, { message: "IGIS Code must be at most 10 characters" })
    .nullable()
    .optional(),
  igis_agent_code: z
    .string({
      required_error: "IGIS Agent Code is required",
      invalid_type_error: "IGIS Agent Code must be a string",
    })
    .length(10, { message: "IGIS Agent Code must be exactly 10 characters" }),
  branch_id: z
    .number({
      required_error: "Branch ID is required",
      invalid_type_error: "Branch ID must be a number",
    })
    .int({
      message: "Branch ID must be an integer",
    }),
  development_officer_id: z
    .number({
      required_error: "Development Officer ID is required",
      invalid_type_error: "Development Officer ID must be a number",
    })
    .int({
      message: "Development Officer ID must be an integer",
    }),
  idev_affiliate: z.boolean().optional().default(false),
  idev_id: z
    .number({ invalid_type_error: "IDev ID must be a number" })
    .int({ message: "IDev ID must be an integer" })
    .nullable()
    .optional(),
});

export const validateAgentUpdate = validateAgent.extend({
  agent_id: z
    .number({
      required_error: "Agent ID is required",
      invalid_type_error: "Agent ID must be a number",
    })
    .int({
      message: "Agent ID must be an integer",
    }),
});

export type AgentType = z.infer<typeof validateAgent>;
export type AgentUpdateType = z.infer<typeof validateAgentUpdate>;
