import { z } from "zod";

export const agentSchema = z.object({
  name: z.string().min(1).max(100),
  igis_code: z.string().max(10).nullable().optional(),
  igis_agent_code: z.string().length(10),
  branch_id: z.number().int(),
  development_officer_id: z.number().int(),
  idev_affiliate: z.boolean().optional().default(false),
  idev_id: z.number().int().nullable().optional(),
})