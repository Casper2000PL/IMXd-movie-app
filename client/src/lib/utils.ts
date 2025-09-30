import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getT3Url = ({
  type,
  fileName,
}: {
  type: string;
  fileName: string;
}) => {
  const S3_BUCKET_NAME = "imxd";

  const uniqueKey = `${type}-${fileName}`;

  const publicUrl = `https://${S3_BUCKET_NAME}.t3.storage.dev/${uniqueKey}`;
  return publicUrl;
};
