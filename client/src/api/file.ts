import { client } from "../../../server/src/client";

export const s3FileUpload = async (file: File) => {
  const response = await client.api.file.$post({
    json: { fileName: file.name, contentType: file.type, size: file.size },
  });

  if (!response.ok) {
    console.log("Failed to upload file: ", response);
    throw new Error("Failed to upload file");
  }

  return response;
};

export const s3FileDelete = async (key: string) => {
  const response = await client.api.file[":key"].$delete({ param: { key } });

  if (!response.ok) {
    console.log("Failed to delete file : ", response);
    throw new Error("Failed to delete file");
  }

  return response;
};
