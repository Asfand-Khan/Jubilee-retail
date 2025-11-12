import prisma from "../config/db";
import {
  LeadInfoListingType,
  LeadInfoType,
  LeadInfoUpdateType,
} from "../validations/leadInfoValidations";
import { LeadStatus } from "@prisma/client";

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

export const getAllLeadInfos = async (data: LeadInfoListingType) => {
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

  const allLeadInfos = await prisma.leadInfo.findMany({
    where: whereClause,
    orderBy: {
      id: "desc",
    },
  });
  return allLeadInfos;
};

export const createLeadInfo = async (data: LeadInfoType, createdBy: number) => {
  const newLeadInfo = await prisma.leadInfo.create({
    data: {
      name: data.name,
      dob: data.dob,
      age: data.age,
      mobile_num: data.mobile_num,
      email_address: data.email_address,
      spouse_dob: data.spouse_dob,
      spouse_age: data.spouse_age,
      kids: data.kids,
      family_kid1_dob: data.family_kid1_dob,
      family_kid2_dob: data.family_kid2_dob,
      family_kid3_dob: data.family_kid3_dob,
      family_kid4_dob: data.family_kid4_dob,
      product_type: data.product_type,
      product_data: data.product_data,
      product_sku: data.product_sku,
      travel_from: data.travel_from,
      travel_to: data.travel_to,
      travel_go: data.travel_go,
      travel_with: data.travel_with,
      travel_country: data.travel_country,
      from_date: data.from_date,
      end_date: data.end_date,
      duration: data.duration,
      insure_against: data.insure_against,
      insure_house: data.insure_house,
      insure_for: data.insure_for,
      insure_live: data.insure_live,
      insure_my: data.insure_my,
      insure_area: data.insure_area,
      insure_live_in: data.insure_live_in,
      parent_insurance: data.parent_insurance,
      parents_or_inlaw: data.parents_or_inlaw,
      parents_mother_dob: data.parents_mother_dob,
      parents_father_dob: data.parents_father_dob,
      created_by: createdBy,
    },
  });
  return newLeadInfo;
};

export const updateLeadStatus = async (data: LeadInfoUpdateType) => {
  const currentLead = await prisma.leadInfo.findUnique({
    where: {
      id: data.lead_info_id,
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

  const updatedLead = await prisma.leadInfo.update({
    where: {
      id: data.lead_info_id,
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

// export const updateAgent = async (agent: AgentUpdateType) => {
//   try {
//     const data = {
//       name: agent.name,
//       igis_agent_code: agent.igis_agent_code,
//       branch_id: agent.branch_id,
//       development_officer_id: agent.development_officer_id,
//       igis_code: agent.igis_code,
//       idev_affiliate: agent.idev_affiliate,
//       idev_id: agent.idev_id,
//     } as any;

//     if (agent.igis_code) {
//       data["igis_code"] = agent.igis_code;
//     }

//     if (agent.idev_affiliate) {
//       data["idev_affiliate"] = agent.idev_affiliate;
//     }

//     if (agent.idev_id) {
//       data["idev_id"] = agent.idev_id;
//     }

//     const newAgent = await prisma.agent.update({
//       data,
//       where: { id: agent.agent_id },
//     });
//     return newAgent;
//   } catch (error: any) {
//     throw new Error(`Failed to update a agent: ${error.message}`);
//   }
// };

// export const getAgentByIGISAgentCode = async (code: string) => {
//   return prisma.agent.findUnique({
//     where: { igis_agent_code: code },
//   });
// };

// export const getAgentById = async (id: number) => {
//   return prisma.agent.findUnique({
//     where: { id },
//   });
// };
