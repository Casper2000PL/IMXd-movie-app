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
import { useForm } from "react-hook-form";
import z from "zod";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";

const formTrailerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  youtubeUrl: z.url("Invalid URL").min(1, "YouTube URL is required"),
});

type FormTrailerData = z.infer<typeof formTrailerSchema>;

interface AddTrailerFormProps<T = FormTrailerData> {
  onSubmit: (data: T) => Promise<void> | void;
  defaultValues?: Partial<FormTrailerData>;
}

const AddTrailerForm = ({ onSubmit, defaultValues }: AddTrailerFormProps) => {
  const addTrailerForm = useForm<FormTrailerData>({
    resolver: zodResolver(formTrailerSchema),
    defaultValues,
  });

  return (
    <Card className="border-2 border-stone-200 px-4 py-10">
      <CardHeader className="text-xl font-bold">Add Trailer</CardHeader>
      <CardContent>
        <Form {...addTrailerForm}>
          <form
            onSubmit={addTrailerForm.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Title */}
            <FormField
              control={addTrailerForm.control}
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

            {/* Title */}
            <FormField
              control={addTrailerForm.control}
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube URL *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter YouTube URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="bg-custom-yellow-100 hover:bg-custom-yellow-300 w-full px-8 py-5 font-semibold text-black"
              disabled={
                addTrailerForm.formState.isSubmitting ||
                !addTrailerForm.formState.isDirty
              }
            >
              {addTrailerForm.formState.isSubmitting ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                "Add trailer"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddTrailerForm;
