import prisma from "../config/db";
import {
  MotorQuote,
  MotorQuoteListingType,
  MotorQuoteStatusUpdateType,
  MotorQuoteUpdateType,
} from "../validations/motorQuoteValidations";

export const getAllMotorQuotes = async (data: MotorQuoteListingType) => {
  try {
    let whereClause = {
      is_deleted: false,
    } as any;

    if (data.date && (!data.status || data.status.length === 0)) {
      const [start, end] = data.date.split(" to ");
      whereClause.created_at = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    if (data.status && data.status.length > 0) {
      whereClause.status = {
        in: data.status,
      };
    }

    const allQuotes = await prisma.motorQuote.findMany({
      where: whereClause,
    });
    return allQuotes;
  } catch (error: any) {
    throw new Error(`Failed to fetch all motor quotes: ${error.message}`);
  }
};

export const createMotorQuote = async (
  motorQuote: MotorQuote,
  createdBy: number
) => {
  try {
    const data = {
      name: motorQuote.name,
      quote_id: motorQuote.quote_id,
      status: motorQuote.status,
      created_by: createdBy,
    } as any;

    if (motorQuote.policy_type) {
      data["policy_type"] = motorQuote.policy_type;
    }

    if (motorQuote.mobile) {
      data["mobile"] = motorQuote.mobile;
    }

    if (motorQuote.email) {
      data["email"] = motorQuote.email;
    }

    if (motorQuote.premium_value) {
      data["premium_value"] = motorQuote.premium_value;
    }

    if (motorQuote.rate) {
      data["rate"] = motorQuote.rate;
    }

    if (motorQuote.vehicle_make) {
      data["vehicle_make"] = motorQuote.vehicle_make;
    }

    if (motorQuote.vehicle_submake) {
      data["vehicle_submake"] = motorQuote.vehicle_submake;
    }

    if (motorQuote.vehicle_model) {
      data["vehicle_model"] = motorQuote.vehicle_model;
    }

    if (motorQuote.vehicle_value) {
      data["vehicle_value"] = motorQuote.vehicle_value;
    }

    if (motorQuote.vehicle_track) {
      data["vehicle_track"] = motorQuote.vehicle_track;
    }

    if (motorQuote.vehicle_body) {
      data["vehicle_body"] = motorQuote.vehicle_body;
    }

    if (motorQuote.vehicle_color) {
      data["vehicle_color"] = motorQuote.vehicle_color;
    }

    if (motorQuote.reg_no) {
      data["reg_no"] = motorQuote.reg_no;
    }

    if (motorQuote.engine_no) {
      data["engine_no"] = motorQuote.engine_no;
    }

    if (motorQuote.chassis_no) {
      data["chassis_no"] = motorQuote.chassis_no;
    }

    if (motorQuote.city_id) {
      data["city_id"] = motorQuote.city_id;
    }

    if (motorQuote.agent_id) {
      data["agent_id"] = motorQuote.agent_id;
    }

    if (motorQuote.branch_id) {
      data["branch_id"] = motorQuote.branch_id;
    }

    const newQuote = await prisma.motorQuote.create({
      data,
    });
    return newQuote;
  } catch (error: any) {
    throw new Error(`Failed to create a motor quote: ${error.message}`);
  }
};

export const updateMotorQuote = async (motorQuote: MotorQuoteUpdateType) => {
  try {
    const data = {} as any;

    if (motorQuote.agent_id) {
      data["agent_id"] = motorQuote.agent_id;
    }

    if (motorQuote.branch_id) {
      data["branch_id"] = motorQuote.branch_id;
    }

    const updatedQuote = await prisma.motorQuote.update({
      data,
      where: {
        id: motorQuote.motor_quote_id,
      },
    });
    return updatedQuote;
  } catch (error: any) {
    throw new Error(`Failed to update a motor quote: ${error.message}`);
  }
};

export const updateMotorQuoteStatus = async (
  motorQuote: MotorQuoteStatusUpdateType
) => {
  try {
    const updatedQuote = await prisma.motorQuote.update({
      data: {
        status: motorQuote.status,
      },
      where: {
        id: motorQuote.motor_quote_id,
      },
    });
    return updatedQuote;
  } catch (error: any) {
    throw new Error(`Failed to update a motor quote status: ${error.message}`);
  }
};

export const getMotorQuoteByQuoteId = async (code: string) => {
  return prisma.motorQuote.findUnique({
    where: { quote_id: code },
  });
};

export const getMotorQuoteById = async (id: number) => {
  return prisma.motorQuote.findUnique({
    where: { id },
  });
};
