import dayjs from "dayjs";
import prisma from "../config/db";
import {
  CallUsDataListingType,
  CallUsDataType,
  CallUsDataUpdateType,
} from "../validations/calUsDataValidations";

export const getAllCallUsData = async (data: CallUsDataListingType) => {
  try {
    let whereClause = {
      is_deleted: false,
    } as any;

    console.log(data);
   if (data.date) {
  const [startStr, endStr] = data.date.split("to").map((d) => d.trim());

  const startDate = dayjs(startStr).startOf("day").toDate();
  const endDate = dayjs(endStr).endOf("day").toDate();

  whereClause.created_at = {
    gte: startDate,
    lte: endDate,
  };
}
    console.log("Query where clause:", whereClause);
    const allCallUsData = await prisma.callUsData.findMany({
      where: whereClause,
      orderBy: {
        id: "desc",
      },
    });
    return allCallUsData;
  } catch (error: any) {
    throw new Error(`Failed to fetch all call us data: ${error.message}`);
  }
};

export const createCallUsData = async (
  callUsData: CallUsDataType,
  createdBy: number
) => {
  try {
    let data = {
      email: callUsData.email,
      name: callUsData.name,
      created_by: createdBy,
    } as any;

    if (callUsData.contact) {
      data["contact"] = callUsData.contact;
    }

    const newCallUsData = await prisma.callUsData.create({
      data,
    });
    return newCallUsData;
  } catch (error: any) {
    throw new Error(`Failed to create a call us data: ${error.message}`);
  }
};

export const updateCallUsData = async (callUsData: CallUsDataUpdateType) => {
  try {
    let data = {
      email: callUsData.email,
      name: callUsData.name,
    } as any;

    if (callUsData.contact) {
      data["contact"] = callUsData.contact;
    }

    const newCallUsData = await prisma.callUsData.update({
      data,
      where: { id: callUsData.call_us_data_id },
    });
    return newCallUsData;
  } catch (error: any) {
    throw new Error(`Failed to update a call us data: ${error.message}`);
  }
};

export const getCallUsDataById = async (id: number) => {
  return prisma.callUsData.findUnique({
    where: { id },
  });
};
