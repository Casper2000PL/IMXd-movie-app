/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { useState } from "react";
import { FileIcon, Trash2Icon } from "lucide-react";
import { useDropzone } from "react-dropzone";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  type: z.string().min(1, {
    message: "Please select a content type.",
  }),
  description: z.string().optional(),
  releaseDate: z.string().optional(),
  runtime: z.string().optional(),
  language: z.string().optional(),
  status: z.string().optional(),
  numberOfSeasons: z.string().optional(),
  numberOfEpisodes: z.string().optional(),
  poster: z
    .any()
    .refine((files) => files?.length > 0, "Poster is required.")
    .refine(
      (files) => files?.[0]?.size <= 5 * 1024 * 1024,
      "Max file size is 5MB.",
    )
    .refine(
      (files) =>
        ["image/jpeg", "image/png", "image/jpg"].includes(files?.[0]?.type),
      "Only .jpg, .jpeg, and .png formats are supported.",
    ),
});

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/add-content")({
  component: RouteComponent,
});

function RouteComponent() {
  const [preview, setPreview] = useState<string | null>(null);

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
      poster: undefined,
    },
  });

  const watchedType = form.watch("type");
  const posterValue = form.watch("poster");

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    // Create FormData for file upload
    const formData = new FormData();
    formData.append("poster", data.poster[0]);
    formData.append("title", data.title);
    formData.append("type", data.type);
    // Add other fields...

    // Here you would typically send the formData to your API
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      form.setValue("poster", files);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(files[0]);
    }
  };

  const clearFile = () => {
    form.setValue("poster", undefined);
    setPreview(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 5,
    maxSize: 1024 * 1024 * 5, // 5 MB limit
    accept: {
      "image/*": [],
    },
  });

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl px-4 py-10">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add New Content</h1>
          <p className="mt-2 text-gray-600">
            Add a new movie or TV show to your database
          </p>
        </div>

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 p-6"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-gray-600">Drop the files here ...</p>
          ) : (
            <p className="text-gray-600">
              Drag 'n' drop some files here, or click to select files
            </p>
          )}
        </div>

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

            {/* Poster - Updated with proper file upload */}
            <FormField
              control={form.control}
              name="poster"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poster *</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Hidden file input */}
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        id="poster-upload"
                        onChange={handleFileChange}
                        ref={field.ref}
                      />

                      {/* Custom file upload button */}
                      <label
                        htmlFor="poster-upload"
                        className="group border-custom-yellow-300 hover:bg-custom-yellow-100/30 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-gray-300"
                      >
                        <FileIcon className="text-custom-yellow-100 h-8 w-8 group-hover:text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">
                            Click to upload poster
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </label>

                      {/* Selected file info */}
                      {posterValue?.[0] && (
                        <div className="rounded-md bg-stone-300/30 p-3">
                          <p className="text-base font-medium text-black">
                            Selected file: {posterValue[0].name}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {(posterValue[0].size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={clearFile}
                            className="bg-destructive hover:bg-destructive/70 mt-5 flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-white transition duration-200"
                          >
                            <Trash2Icon className="size-4" /> Remove file
                          </button>
                        </div>
                      )}

                      {/* Image preview */}
                      {preview && (
                        <div className="relative mt-4">
                          <p className="mb-2 text-sm font-medium">Preview:</p>
                          <img
                            src={preview}
                            alt="Poster preview"
                            className="h-50 rounded border object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Row: Release Date, Runtime, Rating */}
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
