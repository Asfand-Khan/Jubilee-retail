import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { z } from "zod";
import {
  createAgent,
  getAgentById,
  getAgentByIGISAgentCode,
  getAllAgents,
  updateAgent,
} from "../services/agentService";
import {
  validateAgent,
  validateAgentListing,
  validateAgentUpdate,
} from "../validations/agentValidations";

// Module --> Agents
// Method --> GET (Protected)
// Endpoint --> /api/v1/agents
// Description --> Fetch all agents
export const getAllAgentsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validateAgentListing.parse(req.body);
    const agents = await getAllAgents(parsed);
    return res.status(200).json({
      status: 1,
      message: "Agents fetched successfully",
      payload: agents,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Agents
// Method --> POST (Protected)
// Endpoint --> /api/v1/agents
// Description --> Create Agent
export const createAgentHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedAgent = validateAgent.parse(req.body);

    const agentByAgentCode = await getAgentByIGISAgentCode(
      parsedAgent.igis_agent_code
    );

    if (agentByAgentCode) {
      return res.status(400).json({
        status: 0,
        message: "Agent with this agent code already exists",
        payload: [],
      });
    }

    const newAgent = await createAgent(parsedAgent, user.id);

    return res.status(201).json({
      status: 1,
      message: "Agent created successfully",
      payload: [newAgent],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Agent
// Method --> GET (Protected)
// Endpoint --> /api/v1/agents/:id
// Description --> Get single agent
export const getSingleAgentHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const agentId = parseInt(req.params.id);

    if (isNaN(agentId) || agentId <= 0) {
      throw new Error("Invalid agent id");
    }

    const singleAgent = await getAgentById(agentId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single agent successfully",
      payload: [singleAgent],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Agent
// Method --> PUT (Protected)
// Endpoint --> /api/v1/agents/
// Description --> Update agent
export const updateAgentHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedAgent = validateAgentUpdate.parse(req.body);

    const updatedAgent = await updateAgent(parsedAgent);

    return res.status(200).json({
      status: 1,
      message: "Updated agent successfully",
      payload: [updatedAgent],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
