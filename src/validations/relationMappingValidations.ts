import { z } from "zod";

export const validateRelationMappingCreate = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .max(45, { message: "Name must not exceed 45 characters" })
    .optional()
    .or(z.literal("").transform(() => undefined)),

  short_key: z
    .string({ required_error: "Short key is required" })
    .max(10, { message: "Short key must not exceed 10 characters" })
    .optional()
    .or(z.literal("").transform(() => undefined)),

  gender: z
    .string({ required_error: "Gender is required" })
    .max(15, { message: "Gender must not exceed 15 characters" })
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const validateRelationMappingUpdate = validateRelationMappingCreate.extend({
  relation_mapping_id: z
    .number({ required_error: "Relation Mapping ID is required" })
    .int({ message: "Relation Mapping ID must be an integer" }),
});

export type RelationMapping = z.infer<typeof validateRelationMappingCreate>;
export type RelationMappingUpdate = z.infer<typeof validateRelationMappingUpdate>;