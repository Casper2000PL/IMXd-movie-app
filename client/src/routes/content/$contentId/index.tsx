import { getContentById } from "@/api/content";
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
import { convertToEmbedUrl } from "@/utils/convertToEmbedUrl";
import { extractYearFromDate, formatRuntime } from "@/utils/dateUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRightIcon,
  ClapperboardIcon,
  ImageIcon,
  PlusIcon,
  SettingsIcon,
  StarIcon,
  TrendingUpIcon,
  TriangleIcon,
  XIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
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
                      fullScreen={true}
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
                  <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-800">
                    <p className="text-center font-sans text-xl font-semibold text-white">
                      No <br />
                      poster available
                    </p>
                  </div>
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
                    <DialogContent className="flex h-full max-h-screen !w-full !max-w-full flex-col items-center rounded-none border-none bg-gray-800 px-2 pt-4 pb-0 text-white outline-none md:px-4 xl:px-10">
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
                    fullScreen={true}
                    className="flex h-screen w-full flex-col items-center bg-black px-2 pt-4 pb-0 text-white outline-none md:px-4 xl:px-10"
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
