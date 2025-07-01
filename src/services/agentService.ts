import prisma from "../config/db";
import { AgentType, AgentUpdateType } from "../validations/agentValidations";

export const getAllAgents = async () => {
  try {
    const allAgents = await prisma.agent.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allAgents;
  } catch (error: any) {
    throw new Error(`Failed to fetch all Agents: ${error.message}`);
  }
};

export const createAgent = async (agent: AgentType, createdBy: number) => {
  try {
    const data = {
      name: agent.name,
      igis_agent_code: agent.igis_agent_code,
      branch_id: agent.branch_id,
      created_by: createdBy,
      development_officer_id: agent.development_officer_id,
      igis_code: agent.igis_code,
      idev_affiliate: agent.idev_affiliate,
      idev_id: agent.idev_id,
    } as any;

    if (agent.igis_code) {
      data["igis_code"] = agent.igis_code;
    }

    if (agent.idev_affiliate) {
      data["idev_affiliate"] = agent.idev_affiliate;
    }

    if (agent.idev_id) {
      data["idev_id"] = agent.idev_id;
    }

    const newAgent = await prisma.agent.create({
      data,
    });
    return newAgent;
  } catch (error: any) {
    throw new Error(`Failed to create a agent: ${error.message}`);
  }
};

export const updateAgent = async (agent: AgentUpdateType) => {
  try {
    const data = {
      name: agent.name,
      igis_agent_code: agent.igis_agent_code,
      branch_id: agent.branch_id,
      development_officer_id: agent.development_officer_id,
      igis_code: agent.igis_code,
      idev_affiliate: agent.idev_affiliate,
      idev_id: agent.idev_id,
    } as any;

    if (agent.igis_code) {
      data["igis_code"] = agent.igis_code;
    }

    if (agent.idev_affiliate) {
      data["idev_affiliate"] = agent.idev_affiliate;
    }

    if (agent.idev_id) {
      data["idev_id"] = agent.idev_id;
    }

    const newAgent = await prisma.agent.update({
      data,
      where: { id: agent.agent_id },
    });
    return newAgent;
  } catch (error: any) {
    throw new Error(`Failed to update a agent: ${error.message}`);
  }
};

export const getAgentByIGISAgentCode = async (code: string) => {
  return prisma.agent.findUnique({
    where: { igis_agent_code: code },
  });
};

export const getAgentById = async (id: number) => {
  return prisma.agent.findUnique({
    where: { id },
  });
};
