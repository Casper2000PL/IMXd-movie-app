/* eslint-disable @typescript-eslint/no-unused-vars */
export const extractYearFromDate = (dateString?: string | null): string => {
  // Handle null/undefined/empty strings
  if (!dateString || typeof dateString !== "string") {
    return "Unknown year";
  }

  // Trim and check if it's a valid date string
  const trimmedDate = dateString.trim();
  if (!trimmedDate) return "Unknown year";

  try {
    const date = new Date(trimmedDate);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      // Try to extract year from string if it's in format "YYYY-MM-DD"
      const yearMatch = trimmedDate.match(/^(\d{4})/);
      if (yearMatch && yearMatch[1]) {
        return yearMatch[1];
      }
      return "Invalid date";
    }

    return date.getFullYear().toString();
  } catch (error) {
    console.error("Error parsing date:", error);
    return "Invalid date";
  }
};

export function formatRuntime(minutes: number): string {
  if (typeof minutes !== "number" || minutes < 0 || !Number.isFinite(minutes)) {
    throw new Error("Input must be a non-negative finite number");
  }

  if (minutes === 0) {
    return "0m";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}
