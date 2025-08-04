import prisma from "../config/db";
import {
  WebappMapper,
  WebappMapperUpdate,
} from "../validations/webappMapperValidations";

export const getAllWebAppMappers = async () => {
  try {
    const allWebAppMappers = await prisma.webappMapper.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allWebAppMappers;
  } catch (error: any) {
    throw new Error(`Failed to fetch all webapp mappers: ${error.message}`);
  }
};

export const createWebAppMapper = async (
  webAppMapper: WebappMapper,
  createdBy: number
) => {
  try {
    const newWebAppMapper = await prisma.webappMapper.create({
      data: {
        child_sku: webAppMapper.child_sku,
        parent_sku: webAppMapper.parent_sku,
        option_id: webAppMapper.option_id,
        product_id: webAppMapper.product_id,
        plan_id: webAppMapper.plan_id,
        created_by: createdBy,
      },
    });
    return newWebAppMapper;
  } catch (error: any) {
    throw new Error(`Failed to create a web app mapper: ${error.message}`);
  }
};

export const getWebAppMapperById = async (webAppMapperId: number) => {
  try {
    const webAppMapper = await prisma.webappMapper.findUnique({
      where: { id: webAppMapperId },
    });
    return webAppMapper;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch single web app mapper by id: ${error.message}`
    );
  }
};

export const updateWebAppMapperById = async (
  webAppMapper: WebappMapperUpdate
) => {
  try {
    const updatedWebAppMapper = await prisma.webappMapper.update({
      where: {
        id: webAppMapper.webapp_mapper_id,
      },
      data: {
        child_sku: webAppMapper.child_sku,
        parent_sku: webAppMapper.parent_sku,
        option_id: webAppMapper.option_id,
        product_id: webAppMapper.product_id,
        plan_id: webAppMapper.plan_id,
      },
    });
    return updatedWebAppMapper;
  } catch (error: any) {
    throw new Error(`Failed to update a web app mapper : ${error.message}`);
  }
};
