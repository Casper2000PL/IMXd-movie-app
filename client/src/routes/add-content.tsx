/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useForm } from "react-hook-form";
import * as z from "zod";
import { type FileRejection, useDropzone } from "react-dropzone";
import { FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { toast } from "sonner";
import { createContent } from "@/api/content";

const formSchema = z.object({
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

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/add-content")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Accepted files:", acceptedFiles);
  }, []);

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

    console.log("Rejected files:", fileRejections);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: {
      "image/*": [],
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      releaseDate: "",
      runtime: "",
      language: "en",
      status: "released",
      numberOfSeasons: "",
      numberOfEpisodes: "",
    },
  });

  const watchedType = form.watch("type");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
      const createdContent = await createContent(formData);
      console.log("Created content:", createdContent);

      // Show success message
      toast.success("Content created successfully!");

      // Navigate to the content detail page with the ID
      await navigate({
        to: `/contentId/${createdContent.id}`,
        params: { contentId: createdContent.id },
      });
    } catch (error) {
      console.error("Error creating content:", error);
      toast.error("Failed to create content. Please try again.");
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl px-4 py-10">
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter movie or show title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dropzone */}
            <div
              className={cn(
                isDragActive
                  ? "bg-custom-yellow-100/30 border-solid"
                  : "border-dashed",
                "group border-custom-yellow-300 hover:bg-custom-yellow-100/10 w-full cursor-pointer rounded-xl border-2 py-10 transition duration-200",
              )}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <div className="flex w-full flex-col items-center justify-center">
                <FileIcon
                  className={cn(
                    isDragActive ? "text-gray-400" : "text-custom-yellow-100",
                    "size-8 duration-100 group-hover:text-gray-400",
                  )}
                />
                <div className="mt-3 text-center">
                  <p className="mb-0.5 text-sm font-medium text-gray-900">
                    Click to upload poster images
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Content Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
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

            {/* Row: Release Date, Runtime */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchedType === "show"
                        ? "First Air Date"
                        : "Release Date"}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="runtime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Runtime {watchedType === "show" && "(per episode)"}{" "}
                      (minutes)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* TV Show specific fields */}
            {watchedType === "show" && (
              <div className="grid grid-cols-1 gap-4 rounded-lg py-4 md:grid-cols-2">
                <h3 className="col-span-full mb-2 text-lg font-semibold">
                  TV Show Details
                </h3>

                <FormField
                  control={form.control}
                  name="numberOfSeasons"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Seasons</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfEpisodes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Episodes</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="62" {...field} />
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
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input placeholder="en" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                className="px-8"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Adding..." : "Add Content"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
