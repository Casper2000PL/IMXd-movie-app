import { client } from "../../../server/src/client";

export interface Media {
  id: string;
  contentId?: string;
  fileUrl: string;
  type: "image" | "video";
  mediaCategory: "poster" | "gallery_image" | "trailer" | "clip";
  title?: string;
  fileSize: number;
  key?: string;
  createdAt: string;
  updatedAt: string;
}

interface createMediaProps {
  formData: {
    title: string;
    fileUrl: string;
    fileSize: number;
  };
  contentId: string;
  type: "image" | "video";
  mediaCategory: "poster" | "gallery_image" | "trailer" | "clip";
}

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

export const getMedia = async (): Promise<Media[]> => {
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

export const getMediaByContentId = async (
  contentId: string,
): Promise<Media[]> => {
  try {
    const response = await client.api.media.content[":contentId"].$get({
      param: { contentId },
    });

    console.log("Response from getMediaByContentId:", response);

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
