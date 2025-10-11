import { useQuery } from "@tanstack/react-query";
import { client } from "server/src/client";

export const getGenres = async () => {
  try {
    const response = await client.api.genres.$get();

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching genres:", error);
    throw error;
  }
};

export const useGetGenres = () => {
  return useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });
};
