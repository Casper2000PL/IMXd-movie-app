import { getContentById } from "@/api/content";
import { s3FileDelete, s3FileUpload } from "@/api/file";
import { createMedia, getMediaByContentId } from "@/api/media";
import PosterCard from "@/components/poster-card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNextCustom,
  CarouselPreviousCustom,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { convertToEmbedUrl } from "@/utils/convertToEmbedUrl";
import { extractYearFromDate, formatRuntime } from "@/utils/dateUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CameraIcon,
  ChevronRightIcon,
  ClapperboardIcon,
  ImageIcon,
  ImagesIcon,
  Loader,
  PlusIcon,
  SettingsIcon,
  StarIcon,
  Trash2Icon,
  TrendingUpIcon,
  TriangleIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

export const Route = createFileRoute("/content/$contentId/")({
  loader: async ({ params }) => {
    const [contentData, mediaData] = await Promise.all([
      getContentById(params.contentId),
      getMediaByContentId(params.contentId),
    ]);

    return {
      content: contentData,
      media: mediaData,
    };
  },

  component: ContentDetailsComponent,
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  youtubeUrl: z.url("Invalid URL").min(1, "YouTube URL is required"),
});

type FormData = z.infer<typeof formSchema>;

function ContentDetailsComponent() {
  const { content, media } = Route.useLoaderData();
  const { contentId } = Route.useParams();

  console.log("Content data:", content);
  console.log("Media data:", media);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      youtubeUrl: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    createMedia({
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

  const [posters, setPosters] = useState<
    Array<{
      id: string;
      file: File;
      uploading: boolean;
      progress: number;
      key?: string;
      isDeleting: boolean;
      error: boolean;
      objectUrl?: string;
    }>
  >([]);

  const [otherImages, setOtherImages] = useState<
    Array<{
      id: string;
      file: File;
      uploading: boolean;
      progress: number;
      key?: string;
      isDeleting: boolean;
      error: boolean;
      objectUrl?: string;
    }>
  >([]);

  // Enhanced uploadFile function with better error handling
  const uploadFile = useCallback(
    async (file: File, isPoster: boolean = true) => {
      const setFiles = isPoster ? setPosters : setOtherImages;

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === file ? { ...f, uploading: true, progress: 0 } : f,
        ),
      );

      try {
        // Get presigned URL from your API
        const presignedUrlResponse = await s3FileUpload({
          file,
          mediaCategory: isPoster ? "poster" : "gallery_image",
          contentTitle: content.title,
          contentId: content.id,
          type: "image",
        });

        const { presignedUrl, key } = await presignedUrlResponse.json();

        // Upload to S3 using the presigned URL
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentageCompleted = Math.round(
                (event.loaded / event.total) * 100,
              );
              setFiles((prevFiles) =>
                prevFiles.map((p) =>
                  p.file === file
                    ? { ...p, progress: percentageCompleted, key }
                    : p,
                ),
              );
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setFiles((prevFiles) =>
                prevFiles.map((p) =>
                  p.file === file
                    ? {
                        ...p,
                        uploading: false,
                        progress: 100,
                        error: false,
                        key,
                      }
                    : p,
                ),
              );
              toast.success("File uploaded successfully");
              resolve();
            } else {
              console.error(
                `Upload failed with status ${xhr.status}`,
                xhr.responseText,
              );
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = (error) => {
            console.error("Upload error:", error);
            reject(new Error("Upload failed due to network error"));
          };

          // Configure the request
          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);

          // Send the file
          xhr.send(file);
        });
      } catch (error) {
        console.error("Upload error:", error);

        // The error message is now properly extracted from the API response
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast.error(errorMessage);

        setFiles((prevFiles) =>
          prevFiles.map((p) =>
            p.file === file
              ? { ...p, uploading: false, progress: 0, error: true }
              : p,
          ),
        );
      }
    },
    [content.title, content.id],
  );

  // Enhanced removeFile function with better error handling
  async function removeFile(fileId: string, isPoster: boolean = true) {
    const setFiles = isPoster ? setPosters : setOtherImages;
    const files = isPoster ? posters : otherImages;

    try {
      const fileToRemove = files.find((f) => f.id === fileId);

      if (fileToRemove) {
        if (fileToRemove.objectUrl) {
          URL.revokeObjectURL(fileToRemove.objectUrl);
        }
      }

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, isDeleting: true } : f,
        ),
      );

      if (!fileToRemove?.key) {
        throw new Error("File key is missing");
      }

      await s3FileDelete(fileToRemove.key);

      toast.success("File removed successfully");
      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
    } catch (error) {
      console.log("Error in removeFile:", error);

      // The error message is now properly extracted from the API response
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(errorMessage);

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, isDeleting: false, error: true } : f,
        ),
      );
    }
  }

  // First dropzone for posters
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log("Accepted poster files:", acceptedFiles);

      if (acceptedFiles.length > 0) {
        setPosters((prevPosters) => [
          ...prevPosters,
          ...acceptedFiles.map((file) => ({
            id: uuidv4(),
            file,
            uploading: false,
            progress: 0,
            isDeleting: false,
            error: false,
            objectUrl: URL.createObjectURL(file),
          })),
        ]);
      }

      acceptedFiles.forEach((file) => {
        uploadFile(file, true);
      });
    },
    [uploadFile],
  );

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

    console.log("Rejected poster files:", fileRejections);
  }, []);

  // Second dropzone handlers for other images
  const onDropOtherImages = useCallback(
    (acceptedFiles: File[]) => {
      console.log("Accepted other image files:", acceptedFiles);

      if (acceptedFiles.length > 0) {
        setOtherImages((prevImages) => [
          ...prevImages,
          ...acceptedFiles.map((file) => ({
            id: uuidv4(),
            file,
            uploading: false,
            progress: 0,
            isDeleting: false,
            error: false,
            objectUrl: URL.createObjectURL(file),
          })),
        ]);
      }

      acceptedFiles.forEach((file) => {
        uploadFile(file, false);
      });
    },
    [uploadFile],
  );

  const onDropRejectedOtherImages = useCallback(
    (fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const tooManyFiles = fileRejections.find(
          (fileRejection) => fileRejection.errors[0].code === "too-many-files",
        );

        const fileTooLarge = fileRejections.find(
          (fileRejection) => fileRejection.errors[0].code === "file-too-large",
        );

        if (tooManyFiles) {
          toast.error("You can upload up to 10 files at a time.");
        }

        if (fileTooLarge) {
          toast.error("Each file must be less than 25MB.");
        }
      }

      console.log("Rejected other image files:", fileRejections);
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: {
      "image/*": [],
    },
  });

  const {
    getRootProps: getRootPropsOther,
    getInputProps: getInputPropsOther,
    isDragActive: isDragActiveOther,
  } = useDropzone({
    onDrop: onDropOtherImages,
    onDropRejected: onDropRejectedOtherImages,
    maxFiles: 10,
    maxSize: 25 * 1024 * 1024, // 25MB
    accept: {
      "image/*": [],
    },
  });

  const videos = media.filter((m) => m.type === "video");
  const postersImages = media.filter((m) => m.mediaCategory === "poster");
  const images = media.filter((m) => m.type === "image");

  const trailers = media.filter((m) => m.mediaCategory === "trailer");

  const galleryImages = media.filter(
    (m) => m.mediaCategory === "gallery_image",
  );

  return (
    <div className="relative w-full">
      <div className="relative min-h-screen w-full">
        {/* Background Image Layer */}

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              galleryImages[0] && `url("${galleryImages[0].fileUrl}")`,
          }}
        />

        {/* Backdrop Filter Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(20px) brightness(0.4)",
            WebkitBackdropFilter: "blur(20px) brightness(0.4)",
            background: "rgba(36, 36, 36, 0.65)",
          }}
        />

        {/* Content Layer */}
        <div className="relative z-10 mx-auto w-full max-w-7xl py-10">
          {/* Text */}
          <div className="flex w-full justify-between">
            <div>
              <h1 className="font-roboto text-5xl text-white">
                {content.title}
              </h1>
              <div className="mt-1 flex items-center gap-[6px] font-sans text-sm text-stone-400">
                <span>{extractYearFromDate(content.releaseDate)}</span>
                <div className="bg-muted-foreground size-[3px] rounded-full" />
                <span>{content.runtime && formatRuntime(content.runtime)}</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {/* rating */}
              <div className="flex flex-col items-center gap-0.5">
                <p className="text-center font-sans text-sm font-semibold tracking-wider text-stone-400">
                  IMXd RATING
                </p>
                {/* rating button */}
                <button className="flex cursor-pointer justify-between rounded-full px-4 py-[1px] transition-all duration-200 hover:bg-white/10">
                  <div className="flex items-center gap-2.5">
                    <StarIcon
                      className="size-6 text-yellow-500"
                      fill="currentColor"
                    />
                    <div className="flex flex-col">
                      <span className="font-roboto text-lg font-bold text-white">
                        {content.rating}
                        <span className="text-base font-normal text-stone-400">
                          /10
                        </span>
                      </span>
                      <span className="font-roboto text-[10px] font-bold text-stone-400">
                        0 REVIEWS
                      </span>
                    </div>
                  </div>
                </button>
              </div>
              {/* stats */}
              <div className="flex flex-col items-center gap-0.5">
                <p className="text-center font-sans text-sm font-semibold tracking-wider text-stone-400">
                  POPULARITY
                </p>
                {/* ranking button */}
                <button className="flex cursor-pointer gap-2.5 rounded-full px-2.5 py-1 transition-all duration-200 hover:bg-white/10">
                  <div className="flex items-center gap-1.5">
                    <TrendingUpIcon className="size-6 text-green-500" />
                    <span className="font-roboto text-xl font-bold text-white">
                      1,234
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TriangleIcon
                      className="size-2 text-[#A1A1A1]"
                      fill="#A1A1A1"
                    />
                    <p className="font-roboto text-base font-medium text-stone-400">
                      4,567
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="mt-3 w-full">
            <div className="flex h-100 w-full gap-1">
              <div className="flex-1">
                {postersImages.length > 0 ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <PosterCard
                        poster={postersImages[0].fileUrl}
                        className="h-full w-full"
                        withRibbon
                        onRibbonClick={() => {
                          console.log("Add to collection clicked");
                        }}
                      />
                    </DialogTrigger>
                    <DialogContent
                      className="flex h-full max-h-screen !w-full !max-w-full flex-col items-center rounded-none border-2 border-none bg-black px-2 pt-4 pb-0 text-white outline-none md:px-4 xl:px-10"
                      showCloseButton={false}
                    >
                      <div className="h-full w-full">
                        <Carousel
                          className="m-0 h-full w-full p-0"
                          opts={{
                            loop: true,
                            watchDrag: false,
                            duration: 0,
                          }}
                        >
                          <CarouselContent className="m-0 flex h-full w-full p-0">
                            {postersImages.map((image, index) => (
                              <CarouselItem key={index} className="w-full p-0">
                                <div className="flex h-full w-full flex-col gap-5">
                                  <div className="flex w-full items-center justify-between px-2">
                                    <DialogClose className="flex w-fit cursor-pointer items-center justify-center gap-1 rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-white/20 active:bg-white/30">
                                      <XIcon
                                        className="size-5"
                                        strokeWidth={2.5}
                                      />
                                      <span className="font-roboto text-sm font-semibold">
                                        Close
                                      </span>
                                    </DialogClose>
                                    <p className="text-custom-yellow-100 font-roboto text-base">
                                      {index + 1} of {postersImages.length}
                                    </p>
                                  </div>
                                  <div className="flex h-full w-full justify-center">
                                    <img
                                      src={image.fileUrl}
                                      alt={image.title || "Image title"}
                                      className="h-full object-cover"
                                    />
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselNextCustom />
                          <CarouselPreviousCustom />
                        </Carousel>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="h-full w-full cursor-pointer rounded-md bg-gray-800 transition-all duration-200 hover:bg-white/20">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <p className="font-sans text-xl font-semibold text-white">
                            Add posters
                          </p>
                          <PlusIcon className="size-8 text-white" />
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="flex h-full !w-full !max-w-full flex-col overflow-y-scroll rounded-none border-none bg-gray-800 px-2 text-white outline-none md:px-4 xl:px-10">
                      <DialogHeader>
                        <DialogTitle className="mb-8 text-center">
                          Add Posters and Other Images
                        </DialogTitle>

                        {/* First Dropzone - Posters */}
                        <div className="mb-6">
                          <h3 className="mb-4 text-lg font-semibold text-white">
                            Upload Posters
                          </h3>
                          <div
                            className={cn(
                              isDragActive
                                ? "bg-custom-yellow-100/30 border-solid"
                                : "bg-custom-yellow-100/10 border-dashed",
                              "group border-custom-yellow-300 hover:bg-custom-yellow-100/20 w-full cursor-pointer rounded-xl border-2 py-10 transition duration-200",
                            )}
                            {...getRootProps()}
                          >
                            <input {...getInputProps()} />
                            <div className="flex w-full flex-col items-center justify-center">
                              <ImagesIcon
                                className={cn(
                                  isDragActive
                                    ? "text-amber-200"
                                    : "text-custom-yellow-100",
                                  "size-8 duration-100 group-hover:text-amber-200",
                                )}
                              />
                              <div className="mt-4 text-center">
                                <p className="mb-0.5 text-sm font-medium text-white">
                                  Click or drag poster images to upload
                                </p>
                                <p className="text-xs text-stone-400">
                                  PNG, JPG up to 5MB (max 5 files)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rendering uploaded posters  */}
                        <div className="mb-6 grid grid-cols-5 gap-4">
                          {posters.map((poster) => (
                            <div
                              key={poster.id}
                              className="flex flex-col gap-1"
                            >
                              <div className="relative aspect-square overflow-hidden rounded-lg">
                                <img
                                  src={poster.objectUrl}
                                  alt={`${poster.file.name}`}
                                  className="h-full w-full object-cover"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={() => removeFile(poster.id, true)}
                                  disabled={
                                    poster.uploading || poster.isDeleting
                                  }
                                >
                                  {poster.isDeleting ? (
                                    <Loader className="animate-spin" />
                                  ) : (
                                    <Trash2Icon className="size-4" />
                                  )}
                                </Button>
                                {poster.uploading && !poster.isDeleting && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                                    <p className="font-sans font-medium text-white">
                                      {poster.progress}%
                                    </p>
                                    <Loader className="size-4 animate-spin" />
                                  </div>
                                )}

                                {poster.error && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/50">
                                    <p className="font-medium text-white">
                                      Error
                                    </p>
                                  </div>
                                )}
                              </div>
                              <p className="text-muted-foreground truncate px-1 text-sm">
                                {poster.file.name}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Second Dropzone - Other Images */}
                        <div className="mb-6">
                          <h3 className="mb-4 text-lg font-semibold text-white">
                            Upload Other Images
                          </h3>
                          <div
                            className={cn(
                              isDragActiveOther
                                ? "border-solid bg-blue-500/30"
                                : "border-dashed bg-blue-500/10",
                              "group w-full cursor-pointer rounded-xl border-2 border-blue-400 py-10 transition duration-200 hover:bg-blue-500/20",
                            )}
                            {...getRootPropsOther()}
                          >
                            <input {...getInputPropsOther()} />
                            <div className="flex w-full flex-col items-center justify-center">
                              <CameraIcon
                                className={cn(
                                  isDragActiveOther
                                    ? "text-blue-200"
                                    : "text-blue-400",
                                  "size-8 duration-100 group-hover:text-blue-200",
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

                        {/* Rendering uploaded other images */}
                        <div className="grid grid-cols-5 gap-4">
                          {otherImages.map((image) => (
                            <div key={image.id} className="flex flex-col gap-1">
                              <div className="relative aspect-square overflow-hidden rounded-lg">
                                <img
                                  src={image.objectUrl}
                                  alt={`${image.file.name}`}
                                  className="h-full w-full object-cover"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={() => removeFile(image.id, false)}
                                  disabled={image.uploading || image.isDeleting}
                                >
                                  {image.isDeleting ? (
                                    <Loader className="animate-spin" />
                                  ) : (
                                    <Trash2Icon className="size-4" />
                                  )}
                                </Button>
                                {image.uploading && !image.isDeleting && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                                    <p className="font-sans font-medium text-white">
                                      {image.progress}%
                                    </p>
                                    <Loader className="size-4 animate-spin" />
                                  </div>
                                )}

                                {image.error && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/50">
                                    <p className="font-medium text-white">
                                      Error
                                    </p>
                                  </div>
                                )}
                              </div>
                              <p className="text-muted-foreground truncate px-1 text-sm">
                                {image.file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="flex-3">
                {trailers.length > 0 ? (
                  <iframe
                    className="h-full w-full rounded-md"
                    src={convertToEmbedUrl(trailers[0].fileUrl)!}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="h-full w-full cursor-pointer rounded-md bg-gray-800 transition-all duration-200 hover:bg-white/20">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <p className="font-sans text-xl font-semibold text-white">
                            Add trailer
                          </p>
                          <PlusIcon className="size-8 text-white" />
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="flex h-full max-h-screen !w-full !max-w-full flex-col items-center rounded-none border-2 border-none bg-gray-800 px-2 pt-4 pb-0 text-white outline-none md:px-4 xl:px-10">
                      <DialogHeader>
                        <DialogTitle className="text-center">
                          Add Youtube Trailer
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="mt-10 w-full max-w-xl space-y-6"
                        >
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter video title"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="youtubeUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>YouTube URL</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter YouTube URL"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            className="bg-custom-yellow-300 hover:bg-custom-yellow-100/70 w-full font-semibold text-black"
                          >
                            Add Trailer
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                {/* videos button */}
                <Link
                  to="/"
                  className="flex flex-1 flex-col items-center justify-center gap-4 rounded-md bg-white/10 transition-all duration-200 hover:bg-white/25"
                >
                  <ClapperboardIcon className="size-8 text-white" />
                  <p className="font-sans text-sm font-semibold text-white">
                    <span>{videos.length}</span>{" "}
                    {videos.length === 1 ? "VIDEO" : "VIDEOS"}
                  </p>
                </Link>
                {/* images button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-4 rounded-md bg-white/10 transition-all duration-200 hover:bg-white/25">
                      <ImageIcon className="size-8 text-white" />
                      <p className="font-sans text-sm font-semibold text-white">
                        <span>{images.length}</span>{" "}
                        {images.length === 1 ? "IMAGE" : "IMAGES"}
                      </p>
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="flex h-full max-h-screen !w-full !max-w-full flex-col items-center rounded-none border-2 border-none bg-black px-2 pt-4 pb-0 text-white outline-none md:px-4 xl:px-10"
                    showCloseButton={false}
                  >
                    <div className="h-full w-full">
                      <Carousel
                        className="m-0 h-full w-full p-0"
                        opts={{
                          loop: true,
                          watchDrag: false,
                          duration: 0,
                        }}
                      >
                        <CarouselContent className="m-0 flex h-full w-full p-0">
                          {images.map((image, index) => (
                            <CarouselItem key={index} className="w-full p-0">
                              <div className="flex h-full w-full flex-col gap-5">
                                <div className="flex w-full items-center justify-between px-2">
                                  <DialogClose className="flex w-fit cursor-pointer items-center justify-center gap-1 rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-white/20 active:bg-white/30">
                                    <XIcon
                                      className="size-5"
                                      strokeWidth={2.5}
                                    />
                                    <span className="font-roboto text-sm font-semibold">
                                      Close
                                    </span>
                                  </DialogClose>
                                  <p className="text-custom-yellow-100 font-roboto text-base">
                                    {index + 1} of {images.length}
                                  </p>
                                </div>
                                <div className="flex h-full w-full justify-center">
                                  <img
                                    src={image.fileUrl}
                                    alt={image.title || "Image title"}
                                    className="h-full object-cover"
                                  />
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselNextCustom />
                        <CarouselPreviousCustom />
                      </Carousel>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex w-full flex-col">
            <div className="flex w-full gap-12">
              <div className="w-full flex-4">
                {/* Genres Badges */}
                <div className="my-4 flex w-full gap-3">
                  <Link
                    to="/"
                    className="rounded-full border-1 border-stone-300 px-3 py-0.5 font-sans text-sm text-white hover:bg-white/10"
                  >
                    Drama
                  </Link>
                  <Link
                    to="/"
                    className="rounded-full border-1 border-stone-300 px-3 py-0.5 font-sans text-sm text-white hover:bg-white/10"
                  >
                    Comedy
                  </Link>
                </div>
                {/* Description */}
                <div className="font-medium text-white">
                  {content.description}
                </div>
                {/* Creators and Cast */}
                <div className="my-3 flex flex-col">
                  <Separator className="bg-white/20" />
                  <div className="flex gap-3 py-3">
                    <p className="font-sans text-base font-semibold text-white">
                      Director
                    </p>
                    <Link to="/" className="text-blue-400 hover:underline">
                      Tim Mielants
                    </Link>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex gap-3 py-3">
                    <p className="font-sans text-base font-semibold text-white">
                      Writer
                    </p>
                    <Link to="/" className="text-blue-400 hover:underline">
                      Max Porter
                    </Link>
                  </div>
                  <Separator className="bg-white/20" />
                  <Link
                    to="/"
                    className="group flex w-full items-center gap-3 py-3"
                  >
                    <p className="font-sans text-base font-semibold text-white">
                      Stars
                    </p>
                    <p className="text-blue-400 hover:underline">
                      Cillian Murphy
                    </p>
                    <div className="size-[3px] rounded-full bg-white" />
                    <p className="text-blue-400 hover:underline">
                      Tracey Ullman
                    </p>
                    <div className="size-[3px] rounded-full bg-white" />
                    <p className="text-blue-400 hover:underline">Jay Lycurgo</p>
                    <ChevronRightIcon
                      className="group-hover:text-custom-yellow-300 mr-0.5 ml-auto size-5 justify-self-end text-white"
                      strokeWidth={2}
                    />
                  </Link>
                  <Separator className="bg-white/20" />
                </div>
              </div>

              {/* Add to watchlist button */}
              <div className="flex w-full flex-2 items-center justify-center">
                <div className="flex w-full flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-custom-yellow-100 h-8 w-1 rounded-full" />
                    <div>
                      <p className="font-sans text-xs font-semibold tracking-widest text-white">
                        COMING SOON
                      </p>
                      <p className="mt-0.5 font-sans text-xs font-normal text-white">
                        Releases September 19, 2025
                      </p>
                    </div>
                  </div>
                  <button className="bg-custom-yellow-100 hover:bg-custom-yellow-300 flex w-full cursor-pointer items-center gap-0.5 rounded-full px-3 py-2 transition-all duration-200">
                    <PlusIcon className="text-black" />
                    <div className="ml-2">
                      <p className="text-left font-sans text-sm font-semibold text-black">
                        Add to my Watchlist
                      </p>
                      <p className="text-left font-sans text-xs font-medium text-black">
                        Added by 9.5k users
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Second Section */}
      <div className="bg-custom-yellow-100 flex w-full justify-center">
        <div className="flex max-w-7xl items-center py-2">
          <Link
            to="/content/$contentId/settings"
            params={{ contentId }}
            className="flex items-center gap-3 rounded-full px-5 py-2 transition-all duration-200 hover:bg-white/25 active:bg-white/40"
          >
            <p className="font-roboto text-xl font-medium">
              Open settings to edit
            </p>
            <SettingsIcon className="size-6 text-black" strokeWidth={2} />
          </Link>
        </div>
      </div>
      <div className="h-[300px] w-full bg-blue-400"></div>
    </div>
  );
}
