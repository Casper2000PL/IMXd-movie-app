import { client } from "../../../server/src/client";

interface S3FileUploadRequest {
  file: File;
  mediaCategory: "poster" | "gallery_image" | "trailer" | "clip";
  contentTitle: string;
  contentId: string;
  type: "video" | "image";
}

// Define error response types
interface ApiErrorResponse {
  error: string | { message: string };
}

// Helper function to extract error message
const extractErrorMessage = (error: string | { message: string }): string => {
  if (typeof error === "string") {
    return error;
  }
  return error.message || "Unknown error occurred";
};

export const s3FileUpload = async ({
  file,
  mediaCategory,
  contentTitle,
  contentId,
  type,
}: S3FileUploadRequest) => {
  console.log("Uploading file mediaCategory: ", mediaCategory);
  console.log("File details: ", contentTitle);

  const response = await client.api.file.$post({
    json: {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      mediaCategory,
      contentTitle,
      contentId,
      type,
    },
  });

  if (!response.ok) {
    console.log("Failed to upload file: ", response);

    let errorMessage = `Failed to upload file: ${response.statusText}`;

    try {
      const errorData: ApiErrorResponse = await response.json();
      if (errorData.error) {
        errorMessage = extractErrorMessage(errorData.error);
      }
    } catch (parseError) {
      console.log("Could not parse error response:", parseError);
    }

    throw new Error(errorMessage);
  }

  return response;
};

export const s3FileDelete = async (key: string) => {
  const response = await client.api.file[":key"].$delete({ param: { key } });

  if (!response.ok) {
    console.log("Failed to delete file: ", response);

    let errorMessage = `Failed to delete file: ${response.statusText}`;

    try {
      const errorData: ApiErrorResponse = await response.json();
      if (errorData.error) {
        errorMessage = extractErrorMessage(errorData.error);
      }
    } catch (parseError) {
      console.log("Could not parse error response:", parseError);
    }

    throw new Error(errorMessage);
  }

  return response;
};
