import { useQuery } from "@tanstack/react-query";
import { client } from "server/src/client";
import { toast } from "sonner";

export const getCrew = async () => {
  try {
    const response = await client.api.castCrew.$get();
    if (response.ok) {
      const crew = await response.json();
      return crew;
    } else {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      toast.error("Failed to fetch crew.");
    }
  } catch (error) {
    console.error("Error fetching crew:", error);
    throw error;
  }
};

export const useGetCrew = () => {
  return useQuery({
    queryKey: ["crew"],
    queryFn: getCrew,
  });
};
