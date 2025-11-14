import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { z } from "zod";
import { createCity, getAllCities, getAllCitiesThirdParty, getCityByCityCode, getCityById, updateCity } from "../services/cityService";
import { validateCity, validateCityUpdate } from "../validations/cityValidations";

// Module --> City
// Method --> GET (Protected)
// Endpoint --> /api/v1/cities
// Description --> Fetch all cities
export const getAllCitiesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const cities = await getAllCities();
    return res.status(200).json({
      status: 1,
      message: "Cities fetched successfully",
      payload: cities,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> City
// Method --> GET (Protected -- API User)
// Endpoint --> /api/v1/cities/list
// Description --> Fetch all cities for API User
export const getAllCitiesThirdPartyHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const cities = await getAllCitiesThirdParty();
    return res.status(200).json({
      status: 1,
      message: "Cities fetched successfully",
      payload: cities,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> City
// Method --> POST (Protected)
// Endpoint --> /api/v1/cities
// Description --> Create City
export const createCityHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedCity = validateCity.parse(req.body);

    const cityByCityCode = await getCityByCityCode(
      parsedCity.city_code
    );

    if (cityByCityCode) {
      return res.status(400).json({
        status: 0,
        message: "City with this city code already exists",
        payload: [],
      });
    }

    const newCity = await createCity(parsedCity, user.id);

    return res.status(201).json({
      status: 1,
      message: "City created successfully",
      payload: [newCity],
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

// Module --> City
// Method --> GET (Protected)
// Endpoint --> /api/v1/cities/:id
// Description --> Get single cities
export const getSingleCityHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const cityId = parseInt(req.params.id);

    if (isNaN(cityId) || cityId <= 0) {
      throw new Error("Invalid city id");
    }

    const singleCity = await getCityById(cityId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single city successfully",
      payload: [singleCity],
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

// Module --> City
// Method --> PUT (Protected)
// Endpoint --> /api/v1/cities/
// Description --> Update city
export const updateCityHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedCity = validateCityUpdate.parse(req.body);

    const updatedCity = await updateCity(parsedCity);

    return res.status(200).json({
      status: 1,
      message: "Updated city successfully",
      payload: [updatedCity],
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
