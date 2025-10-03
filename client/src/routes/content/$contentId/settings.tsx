import {
  useGetCrew,
  useCreateCastCrew,
  useDeleteCastCrew,
} from "@/api/cast-crew";
import { getContentById, useUpdateContent } from "@/api/content";
import { s3FileUpload } from "@/api/file";
import { useDeleteImageByKey, useMediaByContentId } from "@/api/media";
import { useGetAllPeople } from "@/api/people";
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
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CameraIcon,
  ImagesIcon,
  Loader,
  Trash2Icon,
  Search,
  X,
  UserCircle,
} from "lucide-react";
import { useCallback, useState, useMemo } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/content/$contentId/settings")({
  loader: async ({ params }) => {
    const contentData = await getContentById(params.contentId);
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

type FormCrewValues = z.infer<typeof formCrewSchema>;

function SettingsComponent() {
  const { content } = Route.useLoaderData();
  const { contentId } = Route.useParams();

  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: media = [],
    isLoading: mediaLoading,
    error: mediaError,
  } = useMediaByContentId(contentId);
  const { data: crew = [] } = useGetCrew();
  const { data: people = [], isLoading: peopleLoading } = useGetAllPeople();

  const { mutate: deleteImage } = useDeleteImageByKey();
  const updateContentMutation = useUpdateContent();
  const createCastCrewMutation = useCreateCastCrew();
  const deleteCastCrewMutation = useDeleteCastCrew();

  const formTextData = useForm<z.infer<typeof formSchemaTextData>>({
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

  const formCrew = useForm<FormCrewValues>({
    resolver: zodResolver(formCrewSchema),
    defaultValues: {
      personId: "",
      role: "actor",
      characterName: "",
      creditOrder: 1,
    },
  });

  const watchedType = formTextData.watch("type");
  const watchedRole = formCrew.watch("role");
  const watchedPersonId = formCrew.watch("personId");

  // Find selected person
  const selectedPerson = useMemo(() => {
    return people.find((p) => p.id === watchedPersonId);
  }, [people, watchedPersonId]);

  // Filter people based on search
  const filteredPeople = useMemo(() => {
    if (!searchTerm) return people;
    return people.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [people, searchTerm]);

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
          setSearchTerm("");
        },
      },
    );
  };

  const selectPerson = (personId: string) => {
    formCrew.setValue("personId", personId);
    setShowDropdown(false);
    setSearchTerm("");
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
      <div className="min-h-[300px] w-full bg-gray-800">
        <div className="mx-auto h-full w-full max-w-7xl">
          <div className="flex flex-col px-4 py-10">
            <Form {...formTextData}>
              <form
                onSubmit={formTextData.handleSubmit(onSubmitTextData)}
                className="space-y-6"
              >
                <FormField
                  control={formTextData.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter movie or show title"
                          className="bg-white text-black"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formTextData.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a brief description..."
                          className="min-h-[100px] bg-white text-black"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={formTextData.control}
                    name="releaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          {watchedType === "show"
                            ? "First Air Date"
                            : "Release Date"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formTextData.control}
                    name="runtime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Runtime {watchedType === "show" && "(per episode)"}{" "}
                          (minutes)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            {...field}
                            className="bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {watchedType === "show" && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={formTextData.control}
                      name="numberOfSeasons"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Number of Seasons
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5"
                              {...field}
                              className="bg-white text-black"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formTextData.control}
                      name="numberOfEpisodes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Total Episodes
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="62"
                              {...field}
                              className="bg-white text-black"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-5 md:flex-row">
                  <FormField
                    control={formTextData.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-white">
                          Content Type *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white text-black">
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

                  <FormField
                    control={formTextData.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-white">Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white text-black">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formTextData.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-white">Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white text-black">
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

                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    className="bg-custom-yellow-100 hover:bg-custom-yellow-300 w-full px-8 py-5 font-semibold text-black"
                    disabled={updateContentMutation.isPending}
                  >
                    {updateContentMutation.isPending ? (
                      <Loader className="size-4 animate-spin" />
                    ) : (
                      "Update Content"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
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
                    className="absolute top-2 right-2 rounded-md bg-red-500 p-2 transition-all hover:bg-red-700 disabled:opacity-50"
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
                    className="absolute top-2 right-2 rounded-md bg-red-500 p-2 transition-all hover:bg-red-700 disabled:opacity-50"
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
        </div>
      </div>

      {/* Cast & Crew Section */}
      <div className="min-h-[150px] w-full bg-gray-800">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <h2 className="mb-6 text-3xl font-bold text-white">Cast & Crew</h2>

          {/* Add Cast/Crew Form */}
          <div className="mb-8 rounded-lg bg-gray-700 p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">
              Add Member
            </h3>
            <Form {...formCrew}>
              <form
                onSubmit={formCrew.handleSubmit(onSubmitCrew)}
                className="space-y-4"
              >
                {/* Person Search */}
                <FormField
                  control={formCrew.control}
                  name="personId"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Search Person *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          {selectedPerson ? (
                            <div className="flex items-center gap-3 rounded-lg border-2 border-green-500 bg-gray-600 p-3">
                              {selectedPerson.profileImageUrl ? (
                                <img
                                  src={selectedPerson.profileImageUrl}
                                  alt={selectedPerson.name}
                                  className="size-10 rounded-full object-cover object-top"
                                />
                              ) : (
                                <div className="flex size-10 items-center justify-center rounded-full bg-gray-500">
                                  <UserCircle className="size-8 text-gray-300" />
                                </div>
                              )}
                              <span className="flex-1 font-medium text-white">
                                {selectedPerson.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  formCrew.setValue("personId", "");
                                  setSearchTerm("");
                                }}
                                className="cursor-pointer text-red-400 hover:text-red-300"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Search
                                className="absolute top-3 left-3 text-gray-400"
                                size={20}
                              />
                              <Input
                                type="text"
                                placeholder="Search for a person..."
                                value={searchTerm}
                                onChange={(e) => {
                                  setSearchTerm(e.target.value);
                                  setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className="bg-white pl-10 text-black"
                                disabled={peopleLoading}
                              />
                              {showDropdown && (
                                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-600 bg-gray-800 shadow-lg">
                                  {peopleLoading ? (
                                    <div className="flex justify-center p-4">
                                      <Loader className="size-5 animate-spin text-white" />
                                    </div>
                                  ) : filteredPeople.length > 0 ? (
                                    filteredPeople.map((person) => (
                                      <button
                                        key={person.id}
                                        type="button"
                                        onClick={() => selectPerson(person.id)}
                                        className="flex w-full items-center gap-3 border-b border-gray-700 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-700"
                                      >
                                        {person.profileImageUrl ? (
                                          <img
                                            src={person.profileImageUrl}
                                            alt={person.name}
                                            className="size-10 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex size-10 items-center justify-center rounded-full bg-gray-600">
                                            <UserCircle className="size-8 text-gray-400" />
                                          </div>
                                        )}
                                        <span className="font-medium text-white">
                                          {person.name}
                                        </span>
                                      </button>
                                    ))
                                  ) : (
                                    <p className="px-4 py-3 text-center text-gray-400">
                                      No people found
                                    </p>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role, Character Name, Credit Order */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={formCrew.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Role *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white text-black">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="actor">Actor</SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                            <SelectItem value="producer">Producer</SelectItem>
                            <SelectItem value="writer">Writer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedRole === "actor" && (
                    <FormField
                      control={formCrew.control}
                      name="characterName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Character Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Neo"
                              {...field}
                              className="bg-white text-black"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={formCrew.control}
                    name="creditOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Credit Order
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                            className="bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-custom-yellow-100 hover:bg-custom-yellow-300 w-full px-8 py-5 font-semibold text-black"
                  disabled={
                    createCastCrewMutation.isPending ||
                    !formCrew.formState.isValid
                  }
                >
                  {createCastCrewMutation.isPending ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Cast & Crew List */}
          <div className="rounded-lg bg-gray-700 p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">
              Current Cast & Crew
            </h3>
            {contentCrew.length === 0 ? (
              <p className="text-center text-gray-400">
                No cast or crew members added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {contentCrew.map((member) => {
                  const person = people.find((p) => p.id === member.personId);
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-gray-600 bg-gray-800 p-4"
                    >
                      <div className="flex items-center gap-4">
                        {person?.profileImageUrl ? (
                          <img
                            src={person.profileImageUrl}
                            alt={person.name}
                            className="size-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-12 items-center justify-center rounded-full bg-gray-600">
                            <UserCircle className="size-10 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-white">
                            {person?.name || "Unknown Person"}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
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
                        variant="destructive"
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
          </div>
        </div>
      </div>
    </div>
  );
}
