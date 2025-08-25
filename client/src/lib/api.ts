/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from "../../../server/src/client";

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

interface CreateContentForm {
  title: string | undefined;
  type: string | undefined;
  description: string | undefined;
  releaseDate: string | undefined;
  runtime: string | undefined;
  language: string | undefined;
  status: string | undefined;
  numberOfSeasons?: string | undefined;
  numberOfEpisodes?: string | undefined;
}

export const createContent = async (formData: CreateContentForm) => {
  try {
    console.log("API call - Form data being sent:", formData);

    const response = await client.api.content.$post({
      form: {
        title: formData.title,
        type: formData.type,
        description: formData.description || "",
        releaseDate: formData.releaseDate || "",
        runtime: formData.runtime || "",
        language: formData.language || "en",
        status: formData.status || "released",
        numberOfSeasons: formData.numberOfSeasons || "",
        numberOfEpisodes: formData.numberOfEpisodes || "",
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
