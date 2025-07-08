import prisma from "../config/db";
import { CityType, CityUpdateType } from "../validations/cityValidations";

export const getAllCities = async () => {
  try {
    const allCities = await prisma.city.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allCities;
  } catch (error: any) {
    throw new Error(`Failed to fetch all cities: ${error.message}`);
  }
};

export const createCity = async (city: CityType, createdBy: number) => {
  try {
    let data = {
      city_name: city.city_name,
      city_code: city.city_code,
      country_id: city.country_id,
      priority: city.priority,
      created_by: createdBy,
      is_tcs: city.is_tcs,
      is_blueEx: city.is_blueEx,
      is_leopard: city.is_leopard,
    } as any;

    if (city.igis_city_code) {
      data["igis_city_code"] = city.igis_city_code;
    }

    const newCity = await prisma.city.create({
      data,
    });
    return newCity;
  } catch (error: any) {
    throw new Error(`Failed to create a city: ${error.message}`);
  }
};

export const updateCity = async (city: CityUpdateType) => {
  try {
    let data = {
      city_name: city.city_name,
      city_code: city.city_code,
      country_id: city.country_id,
      priority: city.priority,
      is_tcs: city.is_tcs,
      is_blueEx: city.is_blueEx,
      is_leopard: city.is_leopard,
    } as any;

    if (city.igis_city_code) {
      data["igis_city_code"] = city.igis_city_code;
    }

    const newCity = await prisma.city.update({
      data,
      where: {
        id: city.city_id,
      },
    });
    return newCity;
  } catch (error: any) {
    throw new Error(`Failed to create a city: ${error.message}`);
  }
};

export const getCityByCityCode = async (code: string) => {
  return prisma.city.findUnique({
    where: { city_code: code },
  });
};

export const getCityById = async (id: number) => {
  return prisma.city.findUnique({
    where: { id },
  });
};
