import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "./ui/multi-select";
import { useMemo } from "react";

const addGenreSchema = z.object({
  genre: z.array(z.string()).min(1, {
    message: "At least one genre is required.",
  }),
});

type FormData = z.infer<typeof addGenreSchema>;

type Genre = {
  id: string;
  name: string;
  createdAt: string | null;
};

type ContentGenre = {
  id: string;
  name: string;
  contentId: string;
};

interface AddGenresFormProps<T = FormData> {
  onSubmit: (data: T) => Promise<void> | void;
  genres: Genre[];
  contentGenres?: ContentGenre[];
}

const AddGenresForm = ({
  onSubmit,
  genres = [],
  contentGenres = [],
}: AddGenresFormProps) => {
  // Get the IDs of genres that are already added (pre-selected)
  const preSelectedGenreIds = useMemo(
    () =>
      contentGenres
        .map((cg) => {
          // Find the matching genre by name to get its ID
          const matchingGenre = genres.find((g) => g.name === cg.name);
          return matchingGenre?.id;
        })
        .filter((id): id is string => id !== undefined),
    [contentGenres, genres],
  );

  const addGenresForm = useForm<FormData>({
    resolver: zodResolver(addGenreSchema),
    values: {
      genre: preSelectedGenreIds,
    },
  });

  return (
    <Card className="border-2 border-stone-200 px-4 py-10">
      <CardHeader className="text-xl font-bold">Manage Genres</CardHeader>
      <CardContent>
        <Form {...addGenresForm}>
          <form
            onSubmit={addGenresForm.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FormField
              control={addGenresForm.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genres</FormLabel>
                  <FormControl>
                    <MultiSelect
                      values={field.value}
                      onValuesChange={field.onChange}
                    >
                      <MultiSelectTrigger className="w-full">
                        <MultiSelectValue placeholder="Select genres..." />
                      </MultiSelectTrigger>
                      <MultiSelectContent>
                        <MultiSelectGroup>
                          {genres.map((genre) => (
                            <MultiSelectItem value={genre.id} key={genre.id}>
                              {genre.name}
                            </MultiSelectItem>
                          ))}
                        </MultiSelectGroup>
                      </MultiSelectContent>
                    </MultiSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="bg-custom-yellow-100 hover:bg-custom-yellow-300 w-full px-8 py-5 font-semibold text-black"
              disabled={
                addGenresForm.formState.isSubmitting ||
                !addGenresForm.formState.isDirty
              }
            >
              {addGenresForm.formState.isSubmitting ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                "Update Genres"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddGenresForm;
