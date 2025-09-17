export function isStartBeforeEnd(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD.");
  }

  return start < end;
}