import prisma from "../config/db";
import { LeadStatus } from "@prisma/client";
import {
  LeadMotorInfoListingType,
  LeadMotorInfoType,
  LeadMotorInfoUpdateType,
} from "../validations/leadMotorInfoValidations";

const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  pending: [
    "waiting",
    "interested",
    "not_interested",
    "callback_scheduled",
    "cancelled",
  ],
  waiting: ["interested", "not_interested", "callback_scheduled", "cancelled"],
  interested: [],
  not_interested: [],
  cancelled: [],
  callback_scheduled: ["interested", "not_interested", "cancelled"],
};

export const getAllLeadMotorInfos = async (data: LeadMotorInfoListingType) => {
  let whereClause = {
    is_deleted: false,
  } as any;

  if (data.date) {
    const [start, end] = data.date.split("to").map((d) => d.trim());
    whereClause.created_at = {
      gte: new Date(start),
      lte: new Date(end),
    };
  }

  const allLeadMotorInfos = await prisma.leadMotorInfo.findMany({
    where: whereClause,
    orderBy: {
      id: "desc",
    },
  });
  return allLeadMotorInfos;
};

export const createLeadMotorInfo = async (
  data: LeadMotorInfoType,
  createdBy: number
) => {
  const newLeadMotorInfo = await prisma.leadMotorInfo.create({
    data: {
      full_name: data.full_name,
      policy_type: data.policy_type,
      mobile: data.mobile,
      email: data.email,
      vehicle_make: data.vehicle_make,
      vehicle_submake: data.vehicle_submake,
      vehicle_model: data.vehicle_model,
      vehicle_value: data.vehicle_value,
      vehicle_track_yesno: data.vehicle_track_yesno,
      vehicle_track: data.vehicle_track,
      premium: data.premium,
      created_by: createdBy,
    },
  });
  return newLeadMotorInfo;
};

export const updateLeadMotorStatus = async (data: LeadMotorInfoUpdateType) => {
  const currentLead = await prisma.leadMotorInfo.findUnique({
    where: {
      id: data.lead_motor_info_id,
      is_deleted: false,
    },
  });

  if (!currentLead) {
    throw new Error("Lead not found");
  }

  const currentStatus = currentLead.status;

  if (data.status === "pending" && currentStatus !== "pending") {
    throw new Error("Cannot revert back to pending status");
  }

  if (["interested", "not_interested", "cancelled"].includes(currentStatus)) {
    throw new Error(
      `Lead status is locked. No further transitions allowed from ${currentStatus}`
    );
  }

  const allowedTransitions = VALID_TRANSITIONS[currentStatus];
  if (!allowedTransitions.includes(data.status)) {
    throw new Error(
      `Invalid status transition from ${currentStatus} to ${data.status}. ` +
        `Allowed transitions: ${allowedTransitions.join(", ")}`
    );
  }

  const updatedLead = await prisma.leadMotorInfo.update({
    where: {
      id: data.lead_motor_info_id,
    },
    data: {
      status: data.status,
      updated_at: new Date(),
    },
  });

  return updatedLead;
};

// Helper function to get valid next statuses for a lead
export const getValidNextStatuses = async (
  leadId: number
): Promise<LeadStatus[]> => {
  try {
    const lead = await prisma.leadInfo.findUnique({
      where: {
        id: leadId,
        is_deleted: false,
      },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    const currentStatus = lead.status;

    // Special case for pending status
    if (currentStatus === "pending") {
      return ["waiting"];
    }

    // For locked statuses, no transitions allowed
    if (["interested", "not_interested", "cancelled"].includes(currentStatus)) {
      return [];
    }

    return VALID_TRANSITIONS[currentStatus] || [];
  } catch (error: any) {
    throw new Error(`Failed to get valid next statuses: ${error.message}`);
  }
};
