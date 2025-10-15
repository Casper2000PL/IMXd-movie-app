import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "server/src/client";
import { toast } from "sonner";

export interface CreateContentForm {
  title: string;
  type: string;
  description: string;
  releaseDate: string;
  runtime: string;
  language: string;
  status: string;
  numberOfSeasons?: string;
  numberOfEpisodes?: string;
}

export const getContent = async () => {
  try {
    const response = await client.api.content.$get();

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
};

export const getContentById = async (id: string) => {
  try {
    const response = await client.api.content[":id"].$get({
      param: { id },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching content by ID:", error);
    throw error;
  }
};

export const createContent = async (formData: CreateContentForm) => {
  try {
    console.log("API call - Form data being sent:", formData);
    const response = await client.api.content.$post({
      form: {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        releaseDate: formData.releaseDate,
        runtime: formData.runtime,
        language: formData.language,
        status: formData.status,
        numberOfSeasons: formData.numberOfSeasons,
        numberOfEpisodes: formData.numberOfEpisodes,
      },
    });

    if (response.ok) {
      const createdContent = await response.json();
      console.log("Content created successfully:", createdContent);
      return createdContent;
    } else {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
};

export const updateContent = async (
  id: string,
  formData: CreateContentForm,
) => {
  try {
    console.log("API call - Form data being sent:", formData);
    const response = await client.api.content[":id"].$patch({
      param: { id },
      form: {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        releaseDate: formData.releaseDate,
        runtime: formData.runtime,
        language: formData.language,
        status: formData.status,
        numberOfSeasons: formData.numberOfSeasons,
        numberOfEpisodes: formData.numberOfEpisodes,
      },
    });

    if (response.ok) {
      const updatedContent = await response.json();
      console.log("Content updated successfully:", updatedContent);
      return updatedContent;
    } else {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("Error updating content:", error);
    throw error;
  }
};

// TanStack Query Hooks
export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: CreateContentForm;
    }) => {
      const response = await client.api.content[":id"].$patch({
        param: { id },
        form: {
          title: formData.title,
          type: formData.type,
          description: formData.description,
          releaseDate: formData.releaseDate,
          runtime: formData.runtime,
          language: formData.language,
          status: formData.status,
          numberOfSeasons: formData.numberOfSeasons,
          numberOfEpisodes: formData.numberOfEpisodes,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`,
        );
      }

      const updatedContent = await response.json();
      return updatedContent;
    },
    onSuccess: (variables) => {
      toast.success("Content updated successfully!");

      // Invalidate and refetch content queries
      queryClient.invalidateQueries({ queryKey: ["content"] });
      queryClient.invalidateQueries({ queryKey: ["content", variables.id] });
    },
    onError: (error) => {
      console.error("Error updating content:", error);
      toast.error("Failed to update content. Please try again.");
    },
  });

  return mutation;
};
