export const paginateAndSearch = async ({
  model,
  searchValue = "",
  page = 1,
  limit = 10,
  select,
  searchableStringFields,
  searchableIntegerFields,
}: {
  model: any; // Prisma model (e.g., prisma.user)
  searchValue?: string; // Search term (optional)
  page?: number; // Current page
  limit?: number; // Records per page
  select: any; // Fields to select
  searchableStringFields: string[];
  searchableIntegerFields: string[];
}) => {
  const skip = (page - 1) * limit;

  // Initialize `OR` conditions array
  const OR: any[] = [];

  // Add conditions for string fields
  if (searchValue && !isNaN(Number(searchValue))) {
    OR.push(
      ...searchableStringFields.map((field) => ({
        [field]: { contains: searchValue }, //[field]: { search: searchValue, mode: "insensitive" },
      }))
    );
  }

  // Add conditions for integer fields
  if (searchValue && !isNaN(Number(searchValue))) {
    OR.push(
      ...searchableIntegerFields.map((field) => ({
        [field]: { equals: parseInt(searchValue, 10) },
      }))
    );
  }

  const whereCondition = OR.length > 0 ? { OR } : undefined;

  // Count total matching records
  const totalRecords = await model.count({
    where: OR.length > 0
      ? {
          OR: searchableStringFields.map((field) => ({
            [field]: {
              contains: searchValue, // Remove `mode` for `count`
            },
          })),
        }
      : undefined,
  });

  // Fetch paginated and filtered records
  const data = await model.findMany({
    where: whereCondition,
    skip,
    take: limit,
    select,
  });

  return {
    data,
    totalRecords,
    totalPages: Math.ceil(totalRecords / limit),
    currentPage: page,
    pageSize: limit,
  };
};
