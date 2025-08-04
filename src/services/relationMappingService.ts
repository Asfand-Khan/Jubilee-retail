import prisma from "../config/db";
import {
  RelationMapping,
  RelationMappingUpdate,
} from "../validations/relationMappingValidations";

export const getAllRelationMappings = async () => {
  try {
    const allRelationMappings = await prisma.relationMapping.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allRelationMappings;
  } catch (error: any) {
    throw new Error(`Failed to fetch all relation mappings: ${error.message}`);
  }
};

export const createRelationMapping = async (
  relationMapping: RelationMapping,
  createdBy: number
) => {
  try {
    let dataToSend = {
      created_by: createdBy,
    } as any;

    if (relationMapping.name) {
      dataToSend["name"] = relationMapping.name;
    }
    if (relationMapping.short_key) {
      dataToSend["short_key"] = relationMapping.short_key;
    }
    if (relationMapping.gender) {
      dataToSend["gender"] = relationMapping.gender;
    }

    const newRelationMapping = await prisma.relationMapping.create({
      data: dataToSend,
    });
    return newRelationMapping;
  } catch (error: any) {
    throw new Error(`Failed to create a relation mapping: ${error.message}`);
  }
};

export const getRelationMappingById = async (relationMappingId: number) => {
  try {
    const relationMapping = await prisma.relationMapping.findUnique({
      where: { id: relationMappingId },
    });
    return relationMapping;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch single relation mapping by id: ${error.message}`
    );
  }
};

export const updateRelationMappingById = async (
  relationMapping: RelationMappingUpdate
) => {
  try {
    let dataToSend = {} as any;

    if (relationMapping.name) {
      dataToSend["name"] = relationMapping.name;
    }
    if (relationMapping.short_key) {
      dataToSend["short_key"] = relationMapping.short_key;
    }
    if (relationMapping.gender) {
      dataToSend["gender"] = relationMapping.gender;
    }

    const updatedRelationMapping = await prisma.relationMapping.update({
      data: dataToSend,
      where: { id: relationMapping.relation_mapping_id },
    });
    return updatedRelationMapping;
  } catch (error: any) {
    throw new Error(`Failed to update a relation mapping: ${error.message}`);
  }
};
