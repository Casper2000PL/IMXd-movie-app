import { s3FileDelete, uploadProfileImage } from "@/api/file";
import { deleteUserImage, getUserById, updateUser } from "@/api/user";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ChevronLeftIcon,
  Loader,
  Trash2Icon,
  UploadIcon,
  User2Icon,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/profile/$profileId/edit-profile")({
  component: RouteComponent,

  beforeLoad: ({ params }) => {
    if (!params.profileId) {
      throw redirect({
        to: "/",
      });
    }
  },
  loader: async ({ params }) => {
    const profileInfo = await getUserById(params.profileId);
    return { profileInfo };
  },
});

const formSchema = z.object({
  username: z.string().min(2).max(20),
  //bio: z.string().max(160).optional(),
});

function RouteComponent() {
  const { profileInfo } = Route.useLoaderData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingImage, setUploadingImage] = useState({
    file: null as File | null,
    uploading: false,
    progress: 0,
    key: null as string | null,
    isDeleting: false,
    error: false,
    objectUrl: null as string | null,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profileInfo.name,
    },
  });

  // Enhanced uploadFile function with better error handling
  const uploadFile = useCallback(
    async (file: File) => {
      setUploadingImage((prev) => ({
        ...prev,
        file,
        uploading: true,
        progress: 0,
        error: false,
        objectUrl: URL.createObjectURL(file),
      }));

      try {
        // Get presigned URL from your API
        const presignedUrlResponse = await uploadProfileImage(
          profileInfo.id,
          file,
        );

        const { presignedUrl, key } = await presignedUrlResponse.json();

        // Upload to S3 using the presigned URL
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentageCompleted = Math.round(
                (event.loaded / event.total) * 100,
              );
              setUploadingImage((prev) => ({
                ...prev,
                progress: percentageCompleted,
                key,
              }));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadingImage((prev) => ({
                ...prev,
                uploading: false,
                progress: 100,
                error: false,
                key,
              }));
              toast.success("Profile picture uploaded successfully");
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

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast.error(errorMessage);

        setUploadingImage((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true,
        }));
      }
    },
    [profileInfo.id],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File must be less than 5MB");
        return;
      }

      uploadFile(file);
    },
    [uploadFile],
  );

  const handleChooseImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeUploadedImage = useCallback(async () => {
    if (!uploadingImage.key) {
      // If no key, just clear the local state
      if (uploadingImage.objectUrl) {
        URL.revokeObjectURL(uploadingImage.objectUrl);
      }
      setUploadingImage({
        file: null,
        uploading: false,
        progress: 0,
        key: null,
        isDeleting: false,
        error: false,
        objectUrl: null,
      });
      return;
    }

    try {
      setUploadingImage((prev) => ({
        ...prev,
        isDeleting: true,
      }));

      await s3FileDelete(uploadingImage.key);

      if (uploadingImage.objectUrl) {
        URL.revokeObjectURL(uploadingImage.objectUrl);
      }

      setUploadingImage({
        file: null,
        uploading: false,
        progress: 0,
        key: null,
        isDeleting: false,
        error: false,
        objectUrl: null,
      });

      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(errorMessage);

      setUploadingImage((prev) => ({
        ...prev,
        isDeleting: false,
        error: true,
      }));
    }
  }, [uploadingImage.key, uploadingImage.objectUrl]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Values: ", values);

    const formData = {
      name: values.username,
      // Include the uploaded image key if available
      ...(uploadingImage.key && { imageKey: uploadingImage.key }),
    };

    await updateUser(profileInfo.id, formData);
  }

  async function onDeleteImage() {
    await deleteUserImage(profileInfo.id);
  }

  // Determine which image to show
  const currentImage = uploadingImage.objectUrl || profileInfo.image;

  return (
    <div className="w-full">
      <div className="w-full bg-gray-800">
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <Link
            to=".."
            className="group hover:text-custom-yellow-300 font-roboto flex items-center gap-1 font-semibold text-white"
          >
            <ChevronLeftIcon className="group-hover:text-custom-yellow-300 size-6 text-white" />
            Back
          </Link>
          <h1 className="mt-8 font-sans text-4xl font-medium text-white">
            Edit profile
          </h1>
        </div>
      </div>
      <div className="w-full">
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <div className="xs:flex-row mb-10 flex w-full flex-col items-center justify-start gap-10">
            <div className="relative">
              {currentImage ? (
                <div className="relative">
                  <div className="size-20 lg:size-35">
                    <img
                      src={currentImage}
                      alt="Profile Picture"
                      className="h-full w-full rounded-full object-cover object-top"
                    />
                  </div>
                  {uploadingImage.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <div className="flex flex-col items-center">
                        <p className="font-sans text-sm font-medium text-white">
                          {uploadingImage.progress}%
                        </p>
                        <Loader className="size-4 animate-spin text-white" />
                      </div>
                    </div>
                  )}
                  {uploadingImage.error && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-red-500/50">
                      <p className="text-sm font-medium text-white">Error</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-full bg-white/5 p-6">
                  <User2Icon className="size-23 text-stone-500" />
                </div>
              )}
            </div>
            <div className="flex w-full flex-col gap-4">
              <p className="text-sm text-gray-500">
                {currentImage
                  ? "Change profile picture"
                  : "Upload profile picture"}
              </p>
              <div className="xs:items-start flex w-full flex-col items-center gap-4 md:flex-row">
                <div className="w-fit">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    disabled={
                      uploadingImage.uploading || uploadingImage.isDeleting
                    }
                  />
                  <button
                    type="button"
                    onClick={handleChooseImage}
                    disabled={
                      uploadingImage.uploading || uploadingImage.isDeleting
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-blue-500 bg-white px-4 py-2 text-sm font-bold text-blue-500 transition hover:bg-blue-300/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadingImage.uploading ? (
                      <Loader className="size-4 animate-spin" strokeWidth={3} />
                    ) : (
                      <UploadIcon size={16} strokeWidth={3} />
                    )}
                    {uploadingImage.uploading ? "Uploading..." : "Choose image"}
                  </button>
                </div>
                {(currentImage || uploadingImage.file) && (
                  <button
                    type="button"
                    className="hover:bg-destructive/10 text-destructive flex w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={
                      uploadingImage.file ? removeUploadedImage : onDeleteImage
                    }
                    disabled={
                      uploadingImage.uploading || uploadingImage.isDeleting
                    }
                  >
                    {uploadingImage.isDeleting ? (
                      <Loader
                        className="size-4 animate-spin"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Trash2Icon size={16} strokeWidth={2.5} />
                    )}
                    {uploadingImage.isDeleting ? "Deleting..." : "Delete image"}
                  </button>
                )}
              </div>
              {uploadingImage.file && (
                <p className="text-xs text-gray-500">
                  Selected: {uploadingImage.file.name}
                </p>
              )}
            </div>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-sm space-y-6"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                    <Button
                      type="submit"
                      className="mt-6"
                      disabled={uploadingImage.uploading}
                    >
                      Save
                    </Button>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
