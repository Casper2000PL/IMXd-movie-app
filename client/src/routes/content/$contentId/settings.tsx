import {
  useCreateCastCrew,
  useDeleteCastCrew,
  useGetCastCrewByContentId,
} from "@/api/cast-crew";
import { getContentById, useUpdateContent } from "@/api/content";
import {
  useGetContentGenres,
  useUpdateContentGenres,
} from "@/api/content-genres";
import { s3FileUpload } from "@/api/file";
import { useGetGenres } from "@/api/genres";
import {
  useCreateMedia,
  useDeleteImageByKey,
  useMediaByContentId,
} from "@/api/media";
import { useGetAllPeople } from "@/api/people";
import AddContentForm from "@/components/add-content-form";
import AddGenresForm from "@/components/add-genres-form";
import AddMemberForm from "@/components/add-member-form";
import AddTrailerForm from "@/components/add-trailer-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CameraIcon,
  ImagesIcon,
  Loader,
  Trash2Icon,
  UserCircle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/content/$contentId/settings")({
  loader: async ({ params }) => {
    const [contentData] = await Promise.all([getContentById(params.contentId)]);
    return {
      content: contentData,
    };
  },
  component: SettingsComponent,
});

const formSchemaTextData = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  type: z.string().min(1, { message: "Please select a content type." }),
  description: z.string().min(1, { message: "Description is required." }),
  releaseDate: z.string().min(1, { message: "Release date is required." }),
  runtime: z.string().min(1, { message: "Runtime is required." }),
  language: z.string().min(1, { message: "Language is required." }),
  status: z.string().min(1, { message: "Status is required." }),
  numberOfSeasons: z.string().optional(),
  numberOfEpisodes: z.string().optional(),
});

const formCrewSchema = z.object({
  personId: z.string().min(1, { message: "Person is required." }),
  role: z.enum(["producer", "actor", "director", "writer"]),
  characterName: z.string().optional(),
  creditOrder: z.number().int().min(0, "Credit order must be 0 or greater"),
});

const formTrailerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  youtubeUrl: z.url("Invalid URL").min(1, "YouTube URL is required"),
});

type FormSchemaTextData = z.infer<typeof formSchemaTextData>;
type FormTrailerData = z.infer<typeof formTrailerSchema>;
type FormCrewValues = z.infer<typeof formCrewSchema>;
type FormGenres = {
  genre: string[];
};
function SettingsComponent() {
  const queryClient = useQueryClient();

  const { content } = Route.useLoaderData();
  const { contentId } = Route.useParams();

  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const {
    data: media = [],
    isLoading: mediaLoading,
    error: mediaError,
  } = useMediaByContentId(contentId);

  const { data: crew = [] } = useGetCastCrewByContentId(contentId);
  const { data: people = [], isLoading: peopleLoading } = useGetAllPeople();
  const { data: contentGenres = [] } = useGetContentGenres(contentId);
  const { data: genres = [] } = useGetGenres();

  const { mutate: deleteImage } = useDeleteImageByKey();
  const updateContentMutation = useUpdateContent();
  const createCastCrewMutation = useCreateCastCrew();
  const deleteCastCrewMutation = useDeleteCastCrew();
  const createMediaMutation = useCreateMedia();
  // const addGenresMutation = useAddContentGenresBulk();
  const updateGenresMutation = useUpdateContentGenres();

  const trailers = media.filter((m) => m.mediaCategory === "trailer");

  const formTextData = useForm<FormSchemaTextData>({
    resolver: zodResolver(formSchemaTextData),
    defaultValues: {
      title: content.title || "",
      type: content.type || "",
      description: content.description || "",
      releaseDate: content.releaseDate || "",
      runtime: String(content.runtime) || "",
      language: content.language || "en",
      status: content.status || "",
      numberOfSeasons: String(content.numberOfSeasons) || "",
      numberOfEpisodes: String(content.numberOfEpisodes) || "",
    },
  });

  const formTrailer = useForm<FormTrailerData>({
    resolver: zodResolver(formTrailerSchema),
    defaultValues: {
      title: trailers.length > 0 ? trailers[0].title || "" : "",
      youtubeUrl: trailers.length > 0 ? trailers[0].fileUrl || "" : "",
    },
  });

  const formCrew = useForm<FormCrewValues>({
    resolver: zodResolver(formCrewSchema),
    defaultValues: {
      personId: "",
      role: "actor",
      characterName: "",
      creditOrder: 1,
    },
  });

  // Get crew for this content
  const contentCrew = useMemo(() => {
    return crew.filter((c) => c.contentId === contentId);
  }, [crew, contentId]);

  const uploadFile = useCallback(
    async (file: File, isPoster: boolean = true) => {
      try {
        toast.loading(`Uploading ${file.name}...`, { id: file.name });

        const presignedUrlResponse = await s3FileUpload({
          file,
          mediaCategory: isPoster ? "poster" : "gallery_image",
          contentTitle: content.title,
          contentId: content.id,
          type: "image",
        });

        const { presignedUrl } = await presignedUrlResponse.json();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentageCompleted = Math.round(
                (event.loaded / event.total) * 100,
              );
              toast.loading(
                `Uploading ${file.name}... ${percentageCompleted}%`,
                { id: file.name },
              );
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              toast.dismiss(file.name);
              toast.success(`${file.name} uploaded successfully`);
              queryClient.invalidateQueries({
                queryKey: ["media", "content", contentId],
              });
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () =>
            reject(new Error("Upload failed due to network error"));

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      } catch (error) {
        toast.dismiss(file.name);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      }
    },
    [content.title, content.id, contentId, queryClient],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => uploadFile(file, true));
    },
    [uploadFile],
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const tooManyFiles = fileRejections.find(
        (fr) => fr.errors[0].code === "too-many-files",
      );
      const fileTooLarge = fileRejections.find(
        (fr) => fr.errors[0].code === "file-too-large",
      );
      if (tooManyFiles) toast.error("You can upload up to 5 files at a time.");
      if (fileTooLarge) toast.error("Each file must be less than 25MB.");
    }
  }, []);

  const onDropOtherImages = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => uploadFile(file, false));
    },
    [uploadFile],
  );

  const onDropRejectedOtherImages = useCallback(
    (fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const tooManyFiles = fileRejections.find(
          (fr) => fr.errors[0].code === "too-many-files",
        );
        const fileTooLarge = fileRejections.find(
          (fr) => fr.errors[0].code === "file-too-large",
        );
        if (tooManyFiles)
          toast.error("You can upload up to 10 files at a time.");
        if (fileTooLarge) toast.error("Each file must be less than 25MB.");
      }
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 5,
    maxSize: 25 * 1024 * 1024,
    accept: { "image/*": [] },
  });

  const {
    getRootProps: getRootPropsOther,
    getInputProps: getInputPropsOther,
    isDragActive: isDragActiveOther,
  } = useDropzone({
    onDrop: onDropOtherImages,
    onDropRejected: onDropRejectedOtherImages,
    maxFiles: 10,
    maxSize: 25 * 1024 * 1024,
    accept: { "image/*": [] },
  });

  const handleDeleteImage = (key: string) => {
    setDeletingKey(key);
    deleteImage(key, {
      onSuccess: () => setDeletingKey(null),
      onError: () => setDeletingKey(null),
    });
  };

  const handleDeleteCrew = (id: string) => {
    deleteCastCrewMutation.mutate(id);
  };

  const onSubmitTextData = (values: z.infer<typeof formSchemaTextData>) => {
    updateContentMutation.mutate({ id: content.id, formData: values });
  };

  const onSubmitTrailer = (values: FormTrailerData) => {
    createMediaMutation.mutate({
      contentId,
      formData: {
        title: values.title,
        fileUrl: values.youtubeUrl,
        fileSize: 0,
      },
      type: "video",
      mediaCategory: "trailer",
    });
  };

  const onSubmitCrew = (values: FormCrewValues) => {
    createCastCrewMutation.mutate(
      {
        contentId,
        personId: values.personId,
        role: values.role,
        characterName: values.characterName,
        creditOrder: values.creditOrder,
      },
      {
        onSuccess: () => {
          formCrew.reset({
            personId: "",
            role: "actor",
            characterName: "",
            creditOrder: 1,
          });
        },
      },
    );
  };

  const onSubmitGenres = (values: FormGenres) => {
    console.log("Submitting genres:", values);

    updateGenresMutation.mutate({
      contentId,
      genreIds: values.genre,
    });
  };

  if (mediaLoading) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center">
        <Loader className="size-8 animate-spin" />
      </div>
    );
  }

  if (mediaError) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center">
        <p className="text-red-500">Failed to load media. Please try again.</p>
      </div>
    );
  }

  const postersImages = media.filter((m) => m.mediaCategory === "poster");
  const galleryImages = media.filter(
    (m) => m.mediaCategory === "gallery_image",
  );

  return (
    <div className="w-full">
      {/* Content Form Section */}
      <div className="min-h-[300px] w-full">
        <div className="mx-auto h-full w-full max-w-4xl px-4 py-10">
          <AddContentForm
            onSubmit={onSubmitTextData}
            defaultValues={formTextData.getValues()}
            cardHeader="Edit Content"
          />
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-custom-yellow-300 w-full">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <h1 className="font-roboto mb-10 text-center text-4xl font-extrabold text-black">
            Posters
          </h1>
          {postersImages.length === 0 && (
            <p className="text-center font-medium text-gray-500">
              No posters available
            </p>
          )}
          <div className="grid grid-cols-[repeat(auto-fit,200px)] place-content-center items-end justify-start gap-10">
            {postersImages.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <img
                    src={m.fileUrl}
                    alt={m.title || "Poster"}
                    className="w-[200px] rounded-md object-cover"
                  />
                  <button
                    className="absolute top-2 right-2 cursor-pointer rounded-md bg-red-500 p-2 transition-all hover:bg-red-700 disabled:opacity-50"
                    onClick={() => handleDeleteImage(m.key!)}
                    disabled={deletingKey === m.key}
                  >
                    {deletingKey === m.key ? (
                      <Loader className="size-5 animate-spin text-white" />
                    ) : (
                      <Trash2Icon className="size-5 text-white" />
                    )}
                  </button>
                </div>
                <div className="w-[200px] truncate text-center text-base font-semibold text-black">
                  {m.title}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <div
              className={cn(
                isDragActive
                  ? "border-solid bg-black/40"
                  : "border-dashed bg-black/50",
                "group border-custom-yellow-300 w-full cursor-pointer rounded-xl border-2 py-10 transition hover:bg-black/40",
              )}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <div className="flex w-full flex-col items-center justify-center">
                <ImagesIcon
                  className={cn(
                    isDragActive ? "text-amber-200" : "text-custom-yellow-100",
                    "size-8 group-hover:text-amber-200",
                  )}
                />
                <div className="mt-4 text-center">
                  <p className="mb-0.5 text-sm font-medium text-white">
                    Click or drag poster images to upload
                  </p>
                  <p className="text-xs text-stone-400">
                    PNG, JPG up to 25MB (max 5 files)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h1 className="font-roboto my-10 text-center text-4xl font-extrabold text-black">
            Gallery Images
          </h1>
          {galleryImages.length === 0 && (
            <p className="text-center font-medium text-gray-500">
              No gallery images available
            </p>
          )}
          <div className="grid grid-cols-[repeat(auto-fit,200px)] place-content-center items-end justify-start gap-10">
            {galleryImages.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <img
                    src={m.fileUrl}
                    alt={m.title || "Gallery"}
                    className="w-[200px] rounded-md object-cover"
                  />
                  <button
                    className="absolute top-2 right-2 cursor-pointer rounded-md bg-red-500 p-2 transition-all hover:bg-red-700 disabled:opacity-50"
                    onClick={() => handleDeleteImage(m.key!)}
                    disabled={deletingKey === m.key}
                  >
                    {deletingKey === m.key ? (
                      <Loader className="size-5 animate-spin text-white" />
                    ) : (
                      <Trash2Icon className="size-5 text-white" />
                    )}
                  </button>
                </div>
                <div className="w-[200px] truncate text-center text-base font-semibold text-black">
                  {m.title}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <div
              className={cn(
                isDragActiveOther
                  ? "border-solid bg-blue-500/60"
                  : "border-dashed bg-blue-700/70",
                "group w-full cursor-pointer rounded-xl border-2 border-blue-400 py-10 transition hover:bg-blue-800/60",
              )}
              {...getRootPropsOther()}
            >
              <input {...getInputPropsOther()} />
              <div className="flex w-full flex-col items-center justify-center">
                <CameraIcon
                  className={cn(
                    isDragActiveOther ? "text-blue-200" : "text-blue-400",
                    "size-8 group-hover:text-blue-200",
                  )}
                />
                <div className="mt-4 text-center">
                  <p className="mb-0.5 text-sm font-medium text-white">
                    Click or drag other images to upload
                  </p>
                  <p className="text-xs text-stone-400">
                    PNG, JPG up to 25MB (max 10 files)
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-4xl px-5">
            <AddTrailerForm
              onSubmit={onSubmitTrailer}
              defaultValues={formTrailer.getValues()}
            />
          </div>
        </div>
      </div>

      {/* Cast & Crew Section */}
      <div className="min-h-[150px] w-full bg-stone-100">
        <div className="mx-auto max-w-4xl px-5 py-10">
          {/* Add Cast/Crew Form */}
          <AddMemberForm
            onSubmit={onSubmitCrew}
            people={people}
            peopleLoading={peopleLoading}
            isPending={createCastCrewMutation.isPending}
          />

          {/* Current Cast/Crew List */}
          <Card className="mt-5 border-2 border-stone-200 px-4 py-10">
            <CardHeader className="text-xl font-bold">
              Current Cast & Crew
            </CardHeader>
            <CardContent>
              {contentCrew.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  No cast or crew members added yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {contentCrew.map((member) => {
                    const person = people.find((p) => p.id === member.personId);
                    return (
                      <div
                        key={member.id}
                        className="inset flex items-center justify-between rounded-lg border-2 border-stone-200 p-4 shadow-xs"
                      >
                        <div className="flex items-center gap-4">
                          {person?.profileImageUrl ? (
                            <img
                              src={person.profileImageUrl}
                              alt={person.name}
                              className="size-12 rounded-full object-cover object-top"
                            />
                          ) : (
                            <div className="flex size-12 items-center justify-center rounded-full bg-gray-600">
                              <UserCircle className="size-10 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold">
                              {person?.name || "Unknown Person"}
                            </h4>
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                              <span className="capitalize">{member.role}</span>
                              {member.characterName && (
                                <>
                                  <span>•</span>
                                  <span>as {member.characterName}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>Order: {member.creditOrder}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          className="rounded-md bg-red-500 p-2 transition-all hover:bg-red-700 disabled:opacity-50"
                          size="sm"
                          onClick={() => handleDeleteCrew(member.id)}
                          disabled={deleteCastCrewMutation.isPending}
                        >
                          {deleteCastCrewMutation.isPending ? (
                            <Loader className="size-4 animate-spin" />
                          ) : (
                            <Trash2Icon className="size-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Genres Section */}
      <div className="min-h-[150px] w-full bg-stone-100">
        <div className="mx-auto max-w-4xl px-5 py-10">
          <AddGenresForm
            onSubmit={onSubmitGenres}
            genres={genres}
            contentGenres={contentGenres}
          />
        </div>
      </div>
    </div>
  );
}
