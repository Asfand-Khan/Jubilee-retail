import dayjs from "dayjs";

export function calculateAge(dob: string | null | undefined): number {
  if (!dob) {
    throw new Error("DOB is required to calculate age");
  }

  const birthDate = dayjs(dob, "YYYY-MM-DD");
  if (!birthDate.isValid()) {
    throw new Error("Invalid DOB format, expected YYYY-MM-DD");
  }

  const today = dayjs();
  let age = today.year() - birthDate.year();

  // Adjust if birthday hasn't occurred yet this year
  if (
    today.month() < birthDate.month() ||
    (today.month() === birthDate.month() && today.date() < birthDate.date())
  ) {
    age--;
  }

  return age;
}
