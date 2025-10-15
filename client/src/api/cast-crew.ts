import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "server/src/client";
import { toast } from "sonner";

export interface CreateCastCrewForm {
  contentId: string;
  personId: string;
  role: "producer" | "actor" | "director" | "writer";
  characterName?: string;
  creditOrder?: number;
}

export const getCastCrew = async () => {
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

export const createCastCrew = async (formData: CreateCastCrewForm) => {
  try {
    console.log("API call - Cast crew data being sent:", formData);
    const response = await client.api.castCrew.$post({
      json: formData,
    });

    if (response.ok) {
      const createdCastCrew = await response.json();
      console.log("Cast/Crew created successfully:", createdCastCrew);
      toast.success("Cast/Crew member added successfully!");
      return createdCastCrew;
    } else {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      toast.error("Failed to add cast/crew member.");
    }
  } catch (error) {
    console.error("Error creating cast/crew:", error);
    throw error;
  }
};

export const getCastCrewByContentId = async (contentId: string) => {
  try {
    const response = await client.api.castCrew[":contentId"].$get({
      param: { contentId },
    });

    if (response.ok) {
      const castCrew = await response.json();
      return castCrew;
    } else {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      toast.error("Failed to fetch cast/crew.");
    }
  } catch (error) {
    console.error("Error fetching cast/crew:", error);
    throw error;
  }
};

export const deleteCastCrew = async (id: string) => {
  try {
    const response = await client.api.castCrew[":id"].$delete({
      param: { id },
    });

    if (response.ok) {
      toast.success("Cast/Crew member removed successfully!");
      return true;
    } else {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      toast.error("Failed to remove cast/crew member.");
      return false;
    }
  } catch (error) {
    console.error("Error deleting cast/crew:", error);
    throw error;
  }
};

export const useGetCastCrew = () => {
  const query = useQuery({
    queryKey: ["crew"],
    queryFn: async () => {
      const response = await client.api.castCrew.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch crew.");
      }

      const data = await response.json();

      return data;
    },
  });

  return query;
};

export const useGetCastCrewByContentId = (contentId: string) => {
  const query = useQuery({
    queryKey: ["crew", contentId],
    queryFn: async () => {
      const response = await client.api.castCrew[":contentId"].$get({
        param: { contentId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cast/crew.");
      }

      const data = await response.json();

      return data;
    },
    enabled: !!contentId,
  });

  return query;
};

export const useCreateCastCrew = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateCastCrewForm) => {
      const response = await client.api.castCrew.$post({
        json: data,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`,
        );
      }
      const createdData = await response.json();
      return createdData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew"] });
      if (data?.contentId) {
        queryClient.invalidateQueries({ queryKey: ["crew", data.contentId] });
      }
    },
  });

  return mutation;
};

export const useDeleteCastCrew = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await client.api.castCrew[":id"].$delete({
        param: { id },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`,
        );
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew"] });
    },
  });

  return mutation;
};
