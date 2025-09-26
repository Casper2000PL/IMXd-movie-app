/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getContentById, useUpdateContent } from "@/api/content";
import { s3FileDelete, s3FileUpload } from "@/api/file";
import {
  useCreateMedia,
  useDeleteImageByKey,
  useMediaByContentId,
} from "@/api/media";
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
import { createFileRoute } from "@tanstack/react-router";
import { Loader, Trash2Icon } from "lucide-react";
import { useCallback, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

export const Route = createFileRoute("/content/$contentId/settings")({
  loader: async ({ params }) => {
    const contentData = await getContentById(params.contentId);
    return {
      content: contentData,
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
  const { content } = Route.useLoaderData();
  const { contentId } = Route.useParams();

  // All hooks must be called unconditionally at the top
  const {
    data: media = [],
    isLoading: mediaLoading,
    error: mediaError,
  } = useMediaByContentId(contentId);
  const deleteImageMutation = useDeleteImageByKey();
  const createMediaMutation = useCreateMedia();
  const updateContentMutation = useUpdateContent();

  // Move formTextData hook to the top
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      youtubeUrl: "",
    },
  });

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

  const watchedType = formTextData.watch("type");

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

  // Move useDropzone hooks to the top, before any conditional returns
  const dropzone1 = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: {
      "image/*": [],
    },
  });

  const dropzone2 = useDropzone({
    onDrop: onDropOtherImages,
    onDropRejected: onDropRejectedOtherImages,
    maxFiles: 10,
    maxSize: 25 * 1024 * 1024, // 25MB
    accept: {
      "image/*": [],
    },
  });

  // Now conditional returns can happen after all hooks are called
  if (mediaLoading) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center">
        <Loader className="size-8 animate-spin" />
      </div>
    );
  }

  if (mediaError) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center">
        <p className="text-red-500">Failed to load media. Please try again.</p>
      </div>
    );
  }

  console.log("Content data:", content);
  console.log("Media data:", media);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    createMediaMutation.mutate({
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

  // Handle delete with TanStack Query mutation
  const handleDeleteImage = (key: string) => {
    deleteImageMutation.mutate(key);
  };

  console.log("Dropzone 1: ", dropzone1);
  console.log("Dropzone 2: ", dropzone2);

  const videos = media.filter((m) => m.type === "video");
  const postersImages = media.filter((m) => m.mediaCategory === "poster");
  const images = media.filter((m) => m.type === "image");
  const trailers = media.filter((m) => m.mediaCategory === "trailer");
  const galleryImages = media.filter(
    (m) => m.mediaCategory === "gallery_image",
  );

  const onSubmitTextData = (values: z.infer<typeof formSchemaTextData>) => {
    updateContentMutation.mutate({
      id: content.id,
      formData: values,
    });
  };

  return (
    <div className="w-full">
      <div className="min-h-[300px] w-full bg-gray-800">
        <div className="mx-auto h-full w-full max-w-7xl">
          <div className="flex flex-col px-4 py-10">
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

                {/* Row: Content, Language, Status */}
                <div className="xs:flex-row flex flex-col gap-5">
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

                  <FormField
                    control={formTextData.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white text-black">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
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
                    disabled={updateContentMutation.isPending}
                  >
                    {updateContentMutation.isPending ? (
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
      <div className="bg-custom-yellow-300 min-h-[300px] w-full">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <h1 className="font-roboto mb-10 text-center text-4xl font-extrabold text-black">
            Posters
          </h1>
          {postersImages.length === 0 && (
            <p className="text-center font-medium text-gray-500">
              No posters available
            </p>
          )}
          <div className="grid grid-cols-[repeat(auto-fit,200px)] place-content-center items-end justify-start gap-10">
            {postersImages.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <img
                    src={m.fileUrl}
                    alt={m.title || "Media Image"}
                    className="w-[200px] rounded-md object-cover"
                  />
                  <button
                    className="absolute top-2 right-2 cursor-pointer rounded-md bg-red-500 p-2 transition-all duration-200 hover:bg-red-700 disabled:opacity-50"
                    onClick={() => handleDeleteImage(m.key!)}
                    disabled={deleteImageMutation.isPending}
                  >
                    {deleteImageMutation.isPending ? (
                      <Loader className="size-5 animate-spin text-white" />
                    ) : (
                      <Trash2Icon className="size-5 text-white" />
                    )}
                  </button>
                </div>
                <div className="w-[200px] truncate text-center text-base font-semibold text-black">
                  {m.title}
                </div>
              </div>
            ))}
          </div>
          <h1 className="font-roboto my-10 text-center text-4xl font-extrabold text-black">
            Gallery Images
          </h1>
          {galleryImages.length === 0 && (
            <p className="text-center font-medium text-gray-500">
              No gallery images available
            </p>
          )}
          <div className="grid grid-cols-[repeat(auto-fit,200px)] place-content-center items-end justify-start gap-10">
            {galleryImages.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <img
                    src={m.fileUrl}
                    alt={m.title || "Media Image"}
                    className="w-[200px] rounded-md object-cover"
                  />
                  <button
                    className="absolute top-2 right-2 cursor-pointer rounded-md bg-red-500 p-2 transition-all duration-200 hover:bg-red-700 disabled:opacity-50"
                    onClick={() => handleDeleteImage(m.key!)}
                    disabled={deleteImageMutation.isPending}
                  >
                    {deleteImageMutation.isPending ? (
                      <Loader className="size-5 animate-spin text-white" />
                    ) : (
                      <Trash2Icon className="size-5 text-white" />
                    )}
                  </button>
                </div>
                <div className="w-[200px] truncate text-center text-base font-semibold text-black">
                  {m.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
