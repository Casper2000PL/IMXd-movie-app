import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "server/src/client";
import { toast } from "sonner";

export const getContentGenres = async (contentId: string) => {
  try {
    const response = await client.api.contentGenres[":id"].$get({
      param: { id: contentId },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response: ", errorData);
      throw new Error("Failed to fetch content genres");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching content genres:", error);
    throw error;
  }
};

export const useGetContentGenres = (contentId: string) => {
  return useQuery({
    queryKey: ["content-genres", contentId],
    queryFn: () => getContentGenres(contentId),
  });
};

export const addContentGenre = async (contentId: string, genreId: string) => {
  try {
    const response = await client.api.contentGenres.$post({
      json: { contentId, genreId },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response: ", errorData);
      throw new Error("Failed to add content genre");
    }
    return await response.json();
  } catch (error) {
    console.error("Error adding content genre:", error);
    throw error;
  }
};

export const addContentGenresBulk = async (
  contentId: string,
  genreIds: string[],
) => {
  try {
    const response = await client.api.contentGenres.bulk.$post({
      json: { contentId, genreIds },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response: ", errorData);
      throw new Error("Failed to add content genres");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding content genres:", error);
  }
};

export const useAddContentGenresBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentId,
      genreIds,
    }: {
      contentId: string;
      genreIds: string[];
    }) => addContentGenresBulk(contentId, genreIds),
    onSuccess: () => {
      toast.success("Content added successfully!");

      queryClient.invalidateQueries({ queryKey: ["content-genres"] });
    },
    onError: (error) => {
      console.error("Error updating content:", error);
      toast.error("Failed to update content. Please try again.");
    },
  });
};

export const updateContentGenres = async (
  contentId: string,
  genreIds: string[],
) => {
  try {
    const response = await client.api.contentGenres[":id"].$put({
      param: { id: contentId },
      json: { genreIds },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response: ", errorData);
      throw new Error("Failed to update content genres");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating content genres:", error);
    throw error;
  }
};

export const useUpdateContentGenres = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contentId,
      genreIds,
    }: {
      contentId: string;
      genreIds: string[];
    }) => updateContentGenres(contentId, genreIds),
    onSuccess: (_, variables) => {
      toast.success("Genres updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["content-genres", variables.contentId],
      });
    },
    onError: (error) => {
      console.error("Error updating genres:", error);
      toast.error("Failed to update genres. Please try again.");
    },
  });
};
