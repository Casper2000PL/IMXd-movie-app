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
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Card, CardContent, CardHeader } from "./ui/card";

const addContentSchema = z.object({
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

type FormData = z.infer<typeof addContentSchema>;

interface AddContentFormProps<T = FormData> {
  onSubmit: (data: T) => Promise<void> | void;
  defaultValues?: Partial<FormData>;
  cardHeader?: string;
}

const AddContentForm = ({
  onSubmit,
  defaultValues,
  cardHeader,
}: AddContentFormProps) => {
  const addContentForm = useForm<FormData>({
    resolver: zodResolver(addContentSchema),
    defaultValues,
  });

  const watchedType = addContentForm.watch("type");

  return (
    <Card className="border-2 border-stone-200 px-4 py-10">
      <CardHeader className="text-xl font-bold">{cardHeader}</CardHeader>
      <CardContent>
        <Form {...addContentForm}>
          <form
            onSubmit={addContentForm.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Title */}
            <FormField
              control={addContentForm.control}
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
              control={addContentForm.control}
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
              control={addContentForm.control}
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
                control={addContentForm.control}
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
                control={addContentForm.control}
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
                  control={addContentForm.control}
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
                  control={addContentForm.control}
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
                control={addContentForm.control}
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
                control={addContentForm.control}
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
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                className="bg-custom-yellow-100 hover:bg-custom-yellow-300 w-full px-8 py-5 font-semibold text-black"
                disabled={
                  addContentForm.formState.isSubmitting ||
                  !addContentForm.formState.isDirty
                }
              >
                {addContentForm.formState.isSubmitting ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  "Edit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddContentForm;
