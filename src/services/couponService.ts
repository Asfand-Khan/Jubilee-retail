import { CouponTypeEnum } from "@prisma/client";
import prisma from "../config/db";
import {
  CouponListingSchema,
  CouponSchema,
  GetCouponSchema,
  UpdateCouponSchema,
} from "../validations/couponValidations";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAllCoupons = async (data: CouponListingSchema) => {
  let whereClause = {
    is_deleted: false,
  } as any;

  if (data.product_id && data.product_id.length > 0) {
    whereClause.couponProducts = {
      some: {
        product_id: {
          in: data.product_id,
        },
      },
    };
  }
  return await prisma.coupon.findMany({
    where: whereClause,
    orderBy: {
      id: "desc",
    },
  });
};

export const getCoupon = async (data: GetCouponSchema) => {
  if (!data.cnic) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: data.code, is_active: true },
      include: {
        couponProducts: { select: { product_id: true } },
      },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    const isExpired = isBeforeDate(coupon.expiry_date);
    if (isExpired) {
      throw new Error("Coupon is expired");
    }

    const productIds = coupon.couponProducts.map((p) => p.product_id);

    if (productIds.length === 0) {
      return {
        couponid: coupon.id,
        code: coupon.code,
        campaign_name: coupon.campaign_name,
        expiry_date: coupon.expiry_date,
        application_date: coupon.application_date,
        quantity: coupon.quantity,
        coupon_type: coupon.coupon_type,
        discount_value: coupon.discount_value,
        use_per_customer: coupon.use_per_customer,
        remaining: coupon.remaining,
        coupon_sku: [],
      };
    }

    const webMappers = await prisma.webappMapper.findMany({
      where: { product_id: { in: productIds } },
      select: { child_sku: true },
    });

    const couponSku = webMappers.map((wm) => wm.child_sku);

    return {
      couponid: coupon.id,
      code: coupon.code,
      campaign_name: coupon.campaign_name,
      expiry_date: coupon.expiry_date,
      application_date: coupon.application_date,
      quantity: coupon.quantity,
      coupon_type: coupon.coupon_type,
      discount_value: coupon.discount_value,
      use_per_customer: coupon.use_per_customer,
      remaining: coupon.remaining,
      coupon_sku: couponSku,
    };
  } else {
    const coupon = await prisma.coupon.findUnique({
      where: { code: data.code, is_active: true },
      include: {
        couponProducts: { select: { product_id: true } },
      },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    const isExpired = isBeforeDate(coupon.expiry_date);
    if (isExpired) {
      throw new Error("Coupon is expired");
    }

    const customerUsage = await prisma.couponCustomerUsage.findFirst({
      where: { customer_cnic: data.cnic, coupon_id: coupon.id },
    });

    if (coupon.remaining == 0) {
      throw new Error(`Coupon limit exceeded`);
    }

    if (customerUsage?.coupon_use == coupon.use_per_customer) {
      throw new Error(
        `This customer has already used this coupon ${coupon.use_per_customer} times`
      );
    }

    const productIds = coupon.couponProducts.map((p) => p.product_id);

    if (productIds.length === 0) {
      return {
        couponid: coupon.id,
        code: coupon.code,
        campaign_name: coupon.campaign_name,
        expiry_date: coupon.expiry_date,
        application_date: coupon.application_date,
        quantity: coupon.quantity,
        coupon_type: coupon.coupon_type,
        discount_value: coupon.discount_value,
        use_per_customer: coupon.use_per_customer,
        remaining: coupon.remaining,
        coupon_sku: [],
      };
    }

    const webMappers = await prisma.webappMapper.findMany({
      where: { product_id: { in: productIds } },
      select: { child_sku: true },
    });

    const couponSku = webMappers.map((wm) => wm.child_sku);

    return {
      couponid: coupon.id,
      code: coupon.code,
      campaign_name: coupon.campaign_name,
      expiry_date: coupon.expiry_date,
      application_date: coupon.application_date,
      quantity: coupon.quantity,
      coupon_type: coupon.coupon_type,
      discount_value: coupon.discount_value,
      use_per_customer: coupon.use_per_customer,
      remaining: coupon.remaining,
      coupon_sku: couponSku,
    };
  }
};

export const createCoupon = async (data: CouponSchema, createdBy: number) => {
  return await prisma.$transaction(async (tx) => {
    const newCoupon = await tx.coupon.create({
      data: {
        code: data.code,
        campaign_name: data.campaign_name,
        expiry_date: data.expiry_date,
        application_date: data.application_date,
        quantity: data.quantity,
        coupon_type: data.coupon_type as CouponTypeEnum,
        discount_value: data.discount_value,
        use_per_customer: data.use_per_customer,
        remaining: data.quantity,
        created_by: createdBy,
      },
    });

    let couponProductArray: { product_id: number; coupon_id: number }[] = [];
    if (data.products && data.products.length > 0) {
      couponProductArray = data.products.map((id: number) => ({
        coupon_id: newCoupon.id,
        product_id: id,
      }));
    } else {
      const allProducts = await tx.product.findMany({
        select: {
          id: true,
        },
      });

      couponProductArray = allProducts.map((product) => ({
        coupon_id: newCoupon.id,
        product_id: product.id,
      }));
    }

    await tx.couponProduct.createMany({
      data: couponProductArray,
    });

    return newCoupon;
  });
};

export const isBeforeDate = (date: string) => {
  const expiryDate = dayjs.tz(date, "Asia/Karachi").endOf("day");
  const today = dayjs().tz("Asia/Karachi").startOf("day");
  return expiryDate.isBefore(today);
};

export const couponByCode = async (code: string) => {
  return await prisma.coupon.findUnique({
    where: { code },
  });
};

export const couponById = async (id: number) => {
  return prisma.coupon.findUnique({
    where: { id, is_deleted: false },
    include: { couponProducts: { select: { product_id: true } } },
  });
};

export const updateCoupon = async (
  couponId: number,
  data: UpdateCouponSchema,
  updatedBy: number
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Update main coupon fields
    const updatedCoupon = await tx.coupon.update({
      where: { id: couponId },
      data: {
        campaign_name: data.campaign_name,
        expiry_date: data.expiry_date,
        application_date: data.application_date,
        quantity: data.quantity,
        remaining: data.quantity !== undefined ? data.quantity : undefined, // reset remaining?
        discount_value: data.discount_value,
        use_per_customer: data.use_per_customer,
        coupon_type: data.coupon_type as CouponTypeEnum | undefined,
        is_active: data.is_active,
      },
    });
    if (data.products !== undefined) {
      await tx.couponProduct.deleteMany({
        where: { coupon_id: couponId },
      });

      let newRelations: { coupon_id: number; product_id: number }[] = [];
      if (data.products.length > 0) {
        newRelations = data.products.map((product_id) => ({
          coupon_id: couponId,
          product_id,
        }));
      } else {
        const allProducts = await tx.product.findMany({
          where: { is_deleted: false, is_active: true },
          select: { id: true },
        });
        newRelations = allProducts.map((p) => ({
          coupon_id: couponId,
          product_id: p.id,
        }));
      }

      if (newRelations.length > 0) {
        await tx.couponProduct.createMany({
          data: newRelations,
        });
      }
    }
    return tx.coupon.findUnique({
      where: { id: couponId },
      include: {
        couponProducts: {
          select: { product_id: true },
        },
      },
    });
  });
};
export const getCouponById = async (id: number) => {
  return prisma.coupon.findUnique({
    where: { id },
  });
};