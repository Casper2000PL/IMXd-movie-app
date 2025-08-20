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

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    // Here you would typically send the data to your API
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl px-4 py-10">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add New Content</h1>
          <p className="mt-2 text-gray-600">
            Add a new movie or TV show to your database
          </p>
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
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-blue-50 p-4 md:grid-cols-2">
                <h3 className="col-span-full mb-2 text-lg font-semibold text-blue-800">
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
              <Button type="submit" className="px-8">
                Add Content
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
