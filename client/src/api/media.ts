import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "server/src/client";
import { toast } from "sonner";

interface createMediaProps {
  formData: {
    title: string;
    fileUrl: string;
    fileSize: number;
  };
  contentId: string;
  type: "image" | "video";
  mediaCategory:
    | "poster"
    | "gallery_image"
    | "trailer"
    | "clip"
    | "profile_image";
}

// Original API functions
export const createMedia = async ({
  contentId,
  formData,
  type,
  mediaCategory,
}: createMediaProps) => {
  try {
    const response = await client.api.media.$post({
      form: {
        contentId,
        fileUrl: formData.fileUrl,
        type,
        mediaCategory,
        title: formData.title,
        fileSize: formData.fileSize.toString(),
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error creating media:", error);
    throw error;
  }
};

export const getMedia = async () => {
  try {
    const response = await client.api.media.$get();
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching media:", error);
    throw error;
  }
};

export const getMediaByContentId = async (contentId: string) => {
  try {
    const response = await client.api.media.content[":contentId"].$get({
      param: { contentId },
    });
    console.log("Response from getMediaByContentId:", response);
    if (response.ok) {
      const data = await response.json();
      if (data.length === 0) {
        return [];
      }
      return data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching media by content ID:", error);
    throw error;
  }
};

export const deleteImageByKey = async (key: string) => {
  try {
    const response = await client.api.media.image[":key"].$delete({
      param: { key },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

// TanStack Query Hooks
export const useMediaByContentId = (contentId: string) => {
  const query = useQuery({
    queryKey: ["media", contentId],
    queryFn: async () => {
      const response = await client.api.media.content[":contentId"].$get({
        param: { contentId },
      });

      if (!response.ok) throw new Error("Failed to fetch media.");

      const data = await response.json();

      return data;
    },

    // enabled: !!contentId,
  });

  return query;
};

export const useDeleteImageByKey = (key: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await client.api.media.image[":key"].$delete({
        param: { key },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      toast.success("Image deleted successfully");
      // Invalidate all media queries to refetch
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
    onError: () => {
      toast.error("Failed to delete image");
    },
  });

  return mutation;
};

export const useCreateMedia = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await client.api.media.$post();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      toast.success("Media created successfully");
      // Invalidate all media queries to refetch
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
    onError: () => {
      toast.error("Failed to create media");
    },
  });

  return mutation;
};
