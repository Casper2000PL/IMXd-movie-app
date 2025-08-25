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
import { createContent, getContent } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
});

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/add-content")({
  component: RouteComponent,
});

function RouteComponent() {
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
    console.log("Values: ", values);
    console.log("Values.title: ", values.title);

    const form = {
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

    await createContent(form);

    const content = await getContent();
    console.log("Content: ", content);
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

            {/* Poster - Updated with proper file upload */}
            {/* <FormField
              control={form.control}
              name="poster"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poster *</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        id="poster-upload"
                        onChange={handleFileChange}
                        ref={field.ref}
                      />

                
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
            /> */}

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
