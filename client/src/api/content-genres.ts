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

// Tanstack Hooks

export const useGetContentGenres = (contentId: string) => {
  const query = useQuery({
    queryKey: ["content-genres", contentId],
    queryFn: async () => {
      const response = await client.api.contentGenres[":id"].$get({
        param: { id: contentId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch content genres.");
      }

      const data = await response.json();

      return data;
    },
  });

  return query;
};

export const useAddContentGenresBulk = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      contentId,
      genreIds,
    }: {
      contentId: string;
      genreIds: string[];
    }) => {
      const response = await client.api.contentGenres.bulk.$post({
        json: { contentId, genreIds },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response: ", errorData);
        throw new Error("Failed to add content genres");
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      toast.success("Content added successfully!");

      queryClient.invalidateQueries({ queryKey: ["content-genres"] });
    },
    onError: (error) => {
      console.error("Error updating content:", error);
      toast.error("Failed to update content. Please try again.");
    },
  });

  return mutation;
};

export const useUpdateContentGenres = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      contentId,
      genreIds,
    }: {
      contentId: string;
      genreIds: string[];
    }) => {
      const response = await client.api.contentGenres[":id"].$put({
        param: { id: contentId },
        json: { genreIds },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response: ", errorData);
        throw new Error("Failed to update content genres");
      }

      const data = await response.json();
      return data;
    },
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

  return mutation;
};
