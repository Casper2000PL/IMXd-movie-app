import { s3FileDelete, uploadPersonImage } from "@/api/file";
import { createPerson } from "@/api/people";
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
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Loader, Trash2Icon, UploadIcon, User2Icon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { User } from "shared";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/add-people")({
  component: RouteComponent,
});

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  biography: z.string().min(1, {
    message: "Biography is required.",
  }),
  birth_date: z.string().min(1, {
    message: "Birth date is required.",
  }),
});

type FormData = z.infer<typeof formSchema>;

function RouteComponent() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingImage, setUploadingImage] = useState({
    file: null as File | null,
    uploading: false,
    progress: 0,
    key: null as string | null,
    isDeleting: false,
    error: false,
    objectUrl: null as string | null,
    publicUrl: null as string | null,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      biography: "",
      birth_date: "",
    },
  });

  // Upload file function with progress tracking
  const uploadFile = useCallback(async (file: File) => {
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
      const presignedUrlResponse = await uploadPersonImage(file);
      const { presignedUrl, key, publicUrl } =
        await presignedUrlResponse.json();

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
              publicUrl,
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
              publicUrl,
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

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
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
  }, []);

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
        publicUrl: null,
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
        publicUrl: null,
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);

    const formData = {
      name: values.name,
      biography: values.biography,
      birthDate: values.birth_date,
      profileImageUrl: uploadingImage.publicUrl || "",
    };

    const createdPerson = await createPerson(formData);

    console.log("Created person:", createdPerson);
  };

  const navigate = useNavigate();

  const { data: session } = authClient.useSession();
  const user = session?.user as User;
  const isNotAdmin = !user || user.role !== "ADMIN";

  if (isNotAdmin) {
    navigate({ to: "/" });
    return null;
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl px-4 py-10">
      <div className="w-full">
        {/* Profile Picture Upload Section */}
        <div className="mb-10 flex w-full flex-col items-center justify-start gap-6 sm:flex-row">
          <div className="relative">
            {uploadingImage.objectUrl ? (
              <div className="relative">
                <div className="size-24 lg:size-32">
                  <img
                    src={uploadingImage.objectUrl}
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
              <div className="rounded-full bg-gray-100 p-8">
                <User2Icon className="size-16 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex w-full flex-col gap-4">
            <p className="text-sm text-gray-500">
              {uploadingImage.objectUrl
                ? "Change profile picture"
                : "Upload profile picture"}
            </p>
            <div className="flex w-full flex-col items-center gap-4 sm:items-start md:flex-row">
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
              {uploadingImage.file && (
                <button
                  type="button"
                  className="hover:bg-destructive/10 text-destructive flex w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={removeUploadedImage}
                  disabled={
                    uploadingImage.uploading || uploadingImage.isDeleting
                  }
                >
                  {uploadingImage.isDeleting ? (
                    <Loader className="size-4 animate-spin" strokeWidth={2.5} />
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

        {/* Form Section */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="biography"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief description or synopsis..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem className="w-[150px]">
                  <FormLabel>Birth Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="bg-custom-yellow-100 hover:bg-custom-yellow-300 w-full px-8 py-5 font-semibold text-black"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
