import prisma from "../config/db";
import { ApiUserProductType } from "../validations/apiUserProductValidations";

export const getAllApiUserProducts = async () => {
  const allApiUserProducts = await prisma.$queryRaw`
    SELECT
	    aup.id AS id,
	    au.name,
	    au.email,
	    au.phone,
	    p.product_name,
	    p.product_type,
	    p.product_category_id,
	    aup.product_id,
	    aup.api_user_id,
	    aup.is_active,
	    aup.created_at,
	    aup.updated_at,
	    aup.deleted_at 
    FROM
	    ApiUserProduct aup
	LEFT JOIN ApiUser au ON au.id = aup.api_user_id
	LEFT JOIN Product p ON p.id = aup.product_id
  `;
  return allApiUserProducts;
};

export const getSingleApiUserProducts = async (id: number) => {
  const allApiUserProducts = await prisma.$queryRaw`
    SELECT
	    aup.id AS id,
	    au.name,
	    au.email,
	    au.phone,
	    p.product_name,
	    p.product_type,
	    p.product_category_id,
	    aup.product_id,
	    aup.api_user_id,
	    aup.is_active,
	    aup.created_at,
	    aup.updated_at,
	    aup.deleted_at 
    FROM
	    ApiUserProduct aup
	LEFT JOIN ApiUser au ON au.id = aup.api_user_id
	LEFT JOIN Product p ON p.id = aup.product_id
    WHERE aup.api_user_id = ${id}
  `;
  return allApiUserProducts;
};

export const createApiUserProduct = async (
  data: ApiUserProductType,
  createdBy: number
) => {
  const apiUserProductArray = data.product_id.map((id: number) => {
    return {
      product_id: id,
      api_user_id: data.api_user_id,
      created_by: createdBy,
    };
  });

  await prisma.apiUserProduct.createMany({
    data: apiUserProductArray,
  });

  return [];
};

export const updateApiUserProduct = async (
  data: ApiUserProductType,
  createdBy: number
) => {
  const updateApiUserProductTx = await prisma.$transaction(async (tx) => {
    await tx.apiUserProduct.deleteMany({
      where: {
        api_user_id: data.api_user_id,
      },
    });

    const apiUserProductArray = data.product_id.map((id: number) => {
      return {
        product_id: id,
        api_user_id: data.api_user_id,
        created_by: createdBy,
      };
    });

    await tx.apiUserProduct.createMany({
      data: apiUserProductArray,
    });

    return [];
  });

  return updateApiUserProductTx;
};
