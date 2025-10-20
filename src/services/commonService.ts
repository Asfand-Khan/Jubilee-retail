import prisma from "../config/db";
import { CommonDelete } from "../validations/commonValidations";

export const deleteCommon = async (data: CommonDelete) => {
  try {
    const { module, record_id } = data;

    const normalizedModel = module.charAt(0).toLowerCase() + module.slice(1);

    // ✅ Ensure Prisma client has this model
    const modelClient = (prisma as any)[normalizedModel];
    if (!modelClient) {
      throw new Error(`Model "${module}" not found in Prisma client.`);
    }

    // ✅ Access Prisma internal metadata (case-insensitive search)
    const dmmf = (prisma as any)._runtimeDataModel ?? (prisma as any)._dmmf;
    const modelMap = dmmf.modelMap || dmmf.models;

    // ✅ Handle both old and new Prisma structures
    const modelMeta =
      modelMap?.[module] ||
      modelMap?.[normalizedModel] ||
      Object.values(modelMap || {}).find(
        (m: any) =>
          m.name.toLowerCase() === module.toLowerCase() ||
          m.dbName?.toLowerCase() === module.toLowerCase()
      );

    if (!modelMeta) {
      throw new Error(`Model "${module}" not found in Prisma DMMF.`);
    }

    // ✅ Ensure model has `is_deleted` column
    const hasIsDeleted = (modelMeta.fields || []).some(
      (f: any) => f.name === "is_deleted"
    );
    if (!hasIsDeleted) {
      throw new Error(`Model "${module}" does not have an "is_deleted" field.`);
    }

    // ✅ Soft delete (update)
    const record = await modelClient.update({
      where: { id: record_id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    return record;
  } catch (error: any) {
    throw new Error(`Failed to delete record: ${error.message}`);
  }
};
