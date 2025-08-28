import { client } from "../../../server/src/client";
import { Media } from "./media";

// Types based on your schema
export type ContentType = "movie" | "show";
export type StatusType =
  | "released"
  | "upcoming"
  | "in_production"
  | "canceled"
  | "ended";

export interface Content {
  id: string;
  title: string;
  type: ContentType;
  description?: string;
  releaseDate?: string; // ISO date string
  runtime?: number;
  rating?: string; // decimal as string
  status?: StatusType;
  language?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface ContentWithMedia {
  content: Content;
  media: Media[];
}

export interface CreateContentForm {
  title: string;
  type: ContentType;
  description: string;
  releaseDate: string;
  runtime: string;
  language: string;
  status: StatusType;
  numberOfSeasons?: string;
  numberOfEpisodes?: string;
}

// For the array response from getContent()
export type ContentArray = Content[];

export const getContent = async (): Promise<ContentArray> => {
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

export const getContentById = async (id: string): Promise<Content> => {
  try {
    // Use the correct endpoint structure for URL parameters
    const response = await client.api.content[":id"].$get({
      param: { id }, // Pass as param object, not query
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

export const createContent = async (
  formData: CreateContentForm,
): Promise<Content> => {
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
