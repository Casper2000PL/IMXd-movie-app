/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContent, getContentById, updateContent } from "@/api/content";
import { s3FileDelete, s3FileUpload } from "@/api/file";
import { createMedia, getMediaByContentId } from "@/api/media";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader } from "lucide-react";
import { useCallback, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

export const Route = createFileRoute("/content/$contentId/settings")({
  loader: async ({ params }) => {
    const [contentData, mediaData] = await Promise.all([
      getContentById(params.contentId),
      getMediaByContentId(params.contentId),
    ]);

    return {
      content: contentData,
      media: mediaData,
    };
  },

  component: SettingsComponent,
});

const formSchemaTextData = z.object({
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  type: z.string().min(1, {
    message: "Please select a content type.",
  }),
  description: z.string().min(1, {
    message: "Description is required.",
  }),
  releaseDate: z.string().min(1, {
    message: "Release date is required.",
  }),
  runtime: z.string().min(1, {
    message: "Runtime is required.",
  }),
  language: z.string().min(1, {
    message: "Language is required.",
  }),
  status: z.string().min(1, {
    message: "Status is required.",
  }),
  numberOfSeasons: z.string().optional(),
  numberOfEpisodes: z.string().optional(),
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  youtubeUrl: z.url("Invalid URL").min(1, "YouTube URL is required"),
});

type FormData = z.infer<typeof formSchema>;

function SettingsComponent() {
  const navigate = useNavigate();
  const { content, media } = Route.useLoaderData();
  const { contentId } = Route.useParams();

  console.log("Content data:", content);
  console.log("Media data:", media);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      youtubeUrl: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    createMedia({
      contentId,
      formData: {
        title: values.title,
        fileUrl: values.youtubeUrl,
        fileSize: 0,
      },
      type: "video",
      mediaCategory: "trailer",
    });
  };

  const [posters, setPosters] = useState<
    Array<{
      id: string;
      file: File;
      uploading: boolean;
      progress: number;
      key?: string;
      isDeleting: boolean;
      error: boolean;
      objectUrl?: string;
    }>
  >([]);

  const [otherImages, setOtherImages] = useState<
    Array<{
      id: string;
      file: File;
      uploading: boolean;
      progress: number;
      key?: string;
      isDeleting: boolean;
      error: boolean;
      objectUrl?: string;
    }>
  >([]);

  // Enhanced uploadFile function with better error handling
  const uploadFile = useCallback(
    async (file: File, isPoster: boolean = true) => {
      const setFiles = isPoster ? setPosters : setOtherImages;

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === file ? { ...f, uploading: true, progress: 0 } : f,
        ),
      );

      try {
        // Get presigned URL from your API
        const presignedUrlResponse = await s3FileUpload({
          file,
          mediaCategory: isPoster ? "poster" : "gallery_image",
          contentTitle: content.title,
          contentId: content.id,
          type: "image",
        });

        const { presignedUrl, key } = await presignedUrlResponse.json();

        // Upload to S3 using the presigned URL
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentageCompleted = Math.round(
                (event.loaded / event.total) * 100,
              );
              setFiles((prevFiles) =>
                prevFiles.map((p) =>
                  p.file === file
                    ? { ...p, progress: percentageCompleted, key }
                    : p,
                ),
              );
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setFiles((prevFiles) =>
                prevFiles.map((p) =>
                  p.file === file
                    ? {
                        ...p,
                        uploading: false,
                        progress: 100,
                        error: false,
                        key,
                      }
                    : p,
                ),
              );
              toast.success("File uploaded successfully");
              resolve();
            } else {
              console.error(
                `Upload failed with status ${xhr.status}`,
                xhr.responseText,
              );
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = (error) => {
            console.error("Upload error:", error);
            reject(new Error("Upload failed due to network error"));
          };

          // Configure the request
          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);

          // Send the file
          xhr.send(file);
        });
      } catch (error) {
        console.error("Upload error:", error);

        // The error message is now properly extracted from the API response
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast.error(errorMessage);

        setFiles((prevFiles) =>
          prevFiles.map((p) =>
            p.file === file
              ? { ...p, uploading: false, progress: 0, error: true }
              : p,
          ),
        );
      }
    },
    [content.title, content.id],
  );

  // Enhanced removeFile function with better error handling
  async function removeFile(fileId: string, isPoster: boolean = true) {
    const setFiles = isPoster ? setPosters : setOtherImages;
    const files = isPoster ? posters : otherImages;

    try {
      const fileToRemove = files.find((f) => f.id === fileId);

      if (fileToRemove) {
        if (fileToRemove.objectUrl) {
          URL.revokeObjectURL(fileToRemove.objectUrl);
        }
      }

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, isDeleting: true } : f,
        ),
      );

      if (!fileToRemove?.key) {
        throw new Error("File key is missing");
      }

      await s3FileDelete(fileToRemove.key);

      toast.success("File removed successfully");
      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
    } catch (error) {
      console.log("Error in removeFile:", error);

      // The error message is now properly extracted from the API response
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(errorMessage);

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, isDeleting: false, error: true } : f,
        ),
      );
    }
  }

  // First dropzone for posters
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log("Accepted poster files:", acceptedFiles);

      if (acceptedFiles.length > 0) {
        setPosters((prevPosters) => [
          ...prevPosters,
          ...acceptedFiles.map((file) => ({
            id: uuidv4(),
            file,
            uploading: false,
            progress: 0,
            isDeleting: false,
            error: false,
            objectUrl: URL.createObjectURL(file),
          })),
        ]);
      }

      acceptedFiles.forEach((file) => {
        uploadFile(file, true);
      });
    },
    [uploadFile],
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const tooManyFiles = fileRejections.find(
        (fileRejection) => fileRejection.errors[0].code === "too-many-files",
      );

      const fileTooLarge = fileRejections.find(
        (fileRejection) => fileRejection.errors[0].code === "file-too-large",
      );

      if (tooManyFiles) {
        toast.error("You can upload up to 5 files at a time.");
      }

      if (fileTooLarge) {
        toast.error("Each file must be less than 5MB.");
      }
    }

    console.log("Rejected poster files:", fileRejections);
  }, []);

  // Second dropzone handlers for other images
  const onDropOtherImages = useCallback(
    (acceptedFiles: File[]) => {
      console.log("Accepted other image files:", acceptedFiles);

      if (acceptedFiles.length > 0) {
        setOtherImages((prevImages) => [
          ...prevImages,
          ...acceptedFiles.map((file) => ({
            id: uuidv4(),
            file,
            uploading: false,
            progress: 0,
            isDeleting: false,
            error: false,
            objectUrl: URL.createObjectURL(file),
          })),
        ]);
      }

      acceptedFiles.forEach((file) => {
        uploadFile(file, false);
      });
    },
    [uploadFile],
  );

  const onDropRejectedOtherImages = useCallback(
    (fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const tooManyFiles = fileRejections.find(
          (fileRejection) => fileRejection.errors[0].code === "too-many-files",
        );

        const fileTooLarge = fileRejections.find(
          (fileRejection) => fileRejection.errors[0].code === "file-too-large",
        );

        if (tooManyFiles) {
          toast.error("You can upload up to 10 files at a time.");
        }

        if (fileTooLarge) {
          toast.error("Each file must be less than 25MB.");
        }
      }

      console.log("Rejected other image files:", fileRejections);
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: {
      "image/*": [],
    },
  });

  const {
    getRootProps: getRootPropsOther,
    getInputProps: getInputPropsOther,
    isDragActive: isDragActiveOther,
  } = useDropzone({
    onDrop: onDropOtherImages,
    onDropRejected: onDropRejectedOtherImages,
    maxFiles: 10,
    maxSize: 25 * 1024 * 1024, // 25MB
    accept: {
      "image/*": [],
    },
  });

  console.log("Dropzone 1: ", getRootProps, getInputProps, isDragActive);

  console.log(
    "Dropzone 2: ",
    getRootPropsOther,
    getInputPropsOther,
    isDragActiveOther,
  );

  const videos = media.filter((m) => m.type === "video");
  const postersImages = media.filter((m) => m.mediaCategory === "poster");
  const images = media.filter((m) => m.type === "image");

  const trailers = media.filter((m) => m.mediaCategory === "trailer");

  const galleryImages = media.filter(
    (m) => m.mediaCategory === "gallery_image",
  );

  const formTextData = useForm<z.infer<typeof formSchemaTextData>>({
    resolver: zodResolver(formSchemaTextData),
    defaultValues: {
      title: content.title || "",
      type: content.type || "",
      description: content.description || "",
      releaseDate: content.releaseDate || "",
      runtime: String(content.runtime) || "",
      language: content.language || "en",
      status: content.status || "",
      numberOfSeasons: String(content.numberOfSeasons) || "",
      numberOfEpisodes: String(content.numberOfEpisodes) || "",
    },
  });

  const watchedType = formTextData.watch("type");

  const onSubmitTextData = async (
    values: z.infer<typeof formSchemaTextData>,
  ) => {
    try {
      console.log("Values: ", values);
      console.log("Values.title: ", values.title);

      const formData = {
        title: values.title,
        type: values.type,
        description: values.description,
        releaseDate: values.releaseDate,
        runtime: values.runtime,
        language: values.language,
        status: values.status,
        numberOfSeasons: values.numberOfSeasons,
        numberOfEpisodes: values.numberOfEpisodes,
      };

      // Create the content and get the response with the ID
      const updatedContent = await updateContent(content.id, formData);
      console.log("Updated content:", updatedContent);

      // Show success message
      toast.success("Content updated successfully!");

      // Navigate to the content detail page with the ID
      await navigate({
        to: `/content/${content.id}`,
        params: { contentId: content.id },
      });
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Failed to update content. Please try again.");
    }
  };

  return (
    <div className="w-full">
      <div className="min-h-[300px] w-full bg-gray-800">
        <div className="mx-auto h-full w-full max-w-7xl">
          <div className="flex flex-col py-10">
            <Form {...formTextData}>
              <form
                onSubmit={formTextData.handleSubmit(onSubmitTextData)}
                className="space-y-6"
              >
                {/* Title */}
                <FormField
                  control={formTextData.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter movie or show title"
                          className="bg-white text-black"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content Type */}
                <FormField
                  control={formTextData.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Content Type *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white text-black">
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="movie">Movie</SelectItem>
                          <SelectItem value="show">TV Show</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={formTextData.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a brief description or synopsis..."
                          className="min-h-[100px] bg-white text-black"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Row: Release Date, Runtime */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={formTextData.control}
                    name="releaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          {watchedType === "show"
                            ? "First Air Date"
                            : "Release Date"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formTextData.control}
                    name="runtime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Runtime {watchedType === "show" && "(per episode)"}{" "}
                          (minutes)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            {...field}
                            className="bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* TV Show specific fields */}
                {watchedType === "show" && (
                  <div className="grid grid-cols-1 gap-4 rounded-lg py-4 md:grid-cols-2">
                    <h3 className="col-span-full mb-2 text-lg font-semibold text-white">
                      TV Show Details
                    </h3>

                    <FormField
                      control={formTextData.control}
                      name="numberOfSeasons"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Number of Seasons
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5"
                              {...field}
                              className="bg-white text-black"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formTextData.control}
                      name="numberOfEpisodes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Total Episodes
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="62"
                              {...field}
                              className="bg-white text-black"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Row: Language, Status */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={formTextData.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Language</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="en"
                            {...field}
                            className="bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formTextData.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white text-black">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="released">Released</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="in_production">
                              In Production
                            </SelectItem>
                            <SelectItem value="canceled">Canceled</SelectItem>
                            <SelectItem value="ended">Ended</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    className="bg-custom-yellow-100 hover:bg-custom-yellow-300 w-full max-w-md px-8 py-5 font-semibold text-black"
                    disabled={formTextData.formState.isSubmitting}
                  >
                    {formTextData.formState.isSubmitting ? (
                      <Loader className="size-4 animate-spin" />
                    ) : (
                      "Edit"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="h-[300px] w-full bg-blue-400"></div>
    </div>
  );
}
