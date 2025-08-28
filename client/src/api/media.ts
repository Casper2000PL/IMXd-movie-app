import { client } from "../../../server/src/client";

export interface Media {
  id: string;
  contentId?: string;
  fileUrl: string;
  type: "image" | "video";
  mediaCategory: "poster" | "trailer" | "clip";
  title?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export const getMediaByContentId = async (
  contentId: string,
): Promise<Media[]> => {
  try {
    const response = await client.api.media[":contentId"].$get({
      param: { contentId },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      //throw new Error(`HTTP error! status: ${response.status}`);

      // TODO getMediaByContentId always returns error, empty media record in media table should be created along with the content

      return [];
    }
  } catch (error) {
    console.error("Error fetching media by content ID:", error);
    throw error;
  }
};
