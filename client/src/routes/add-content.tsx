import { createContent } from "@/api/content";
import AddContentForm from "@/components/add-content-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

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

export const Route = createFileRoute("/add-content")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const addContentForm = useForm<FormData>({
    resolver: zodResolver(addContentSchema),
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

  const onSubmit = async (values: z.infer<typeof addContentSchema>) => {
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
        to: `/content/${createdContent.id}`,
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
        <AddContentForm
          onSubmit={onSubmit}
          defaultValues={addContentForm.getValues()}
          cardHeader="Add New Content"
        />
      </div>
    </div>
  );
}
