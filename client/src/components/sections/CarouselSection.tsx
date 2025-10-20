import { Link } from "@tanstack/react-router";
import {
  ChevronRightIcon,
  CirclePlayIcon,
  HeartIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PosterCard from "../poster-card";
import TrailerCard from "../trailer-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNextCustom,
  CarouselPreviousCustom,
  type CarouselApi,
} from "../ui/carousel";
import type { Content, Media, ContentWithMedia } from "shared/dist";

interface CarouselSectionProps {
  content: Content[];
  media: Media[];
}

const CarouselSection = ({ content, media }: CarouselSectionProps) => {
  const contentWithMedia: ContentWithMedia[] = content.map((item) => ({
    content: item,
    media: media.filter((m) => m.contentId === item.id),
  }));

  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [sideApi, setSideApi] = useState<CarouselApi>();
  const [currentMainIndex, setCurrentMainIndex] = useState(0);

  const getUpNextItems = useCallback(
    (currentIndex: number) => {
      if (contentWithMedia.length === 0) return [];

      const nextItems = [];
      const itemsToShow = Math.min(3, contentWithMedia.length - 1);

      for (let i = 1; i <= itemsToShow; i++) {
        const nextIndex = (currentIndex + i) % contentWithMedia.length;
        nextItems.push(contentWithMedia[nextIndex]);
      }

      // If we have fewer than 3 items total, just return what we have
      if (contentWithMedia.length <= 3) {
        return contentWithMedia.filter((_, index) => index !== currentIndex);
      }

      return nextItems;
    },
    [contentWithMedia],
  );

  const updateSideCarousel = useCallback(() => {
    if (sideApi && contentWithMedia.length > 1) {
      sideApi.scrollTo(0, true);
    }
  }, [sideApi, contentWithMedia.length]);

  useEffect(() => {
    if (!mainApi) return;

    const onSelect = () => {
      const newIndex = mainApi.selectedScrollSnap();
      setCurrentMainIndex(newIndex);
      updateSideCarousel();
    };

    mainApi.on("select", onSelect);
    onSelect();

    return () => {
      mainApi.off("select", onSelect);
    };
  }, [mainApi, updateSideCarousel]);

  return (
    <section className="mt-2 flex max-h-200 min-h-140 w-full gap-4 max-lg:px-2">
      {/* Carousel Big */}
      <div className="flex min-h-full w-full flex-9">
        <Carousel
          setApi={setMainApi}
          className="h-full w-full flex-1"
          opts={{
            loop: true,
          }}
        >
          <div className="h-full w-full">
            <CarouselContent className="m-0 h-full w-full p-0">
              {contentWithMedia.map((item) => {
                // Filter for poster media
                const posterMedia = item.media.find(
                  (m) => m.mediaCategory === "poster",
                );

                const galleryMedia = item.media.filter(
                  (m) => m.mediaCategory === "gallery_image",
                );

                const backgroundMedia = galleryMedia[0];

                console.log("Background media:", backgroundMedia?.fileUrl);

                return (
                  <CarouselItem
                    key={item.content.id}
                    className="group relative min-h-150 w-full cursor-pointer overflow-visible p-0"
                  >
                    <Link
                      to="/content/$contentId"
                      params={{ contentId: item.content.id }}
                    >
                      <div
                        className="flex h-120 w-full items-center justify-center rounded-md mask-b-from-50% mask-b-to-90% transition duration-300 hover:opacity-90"
                        style={{
                          backgroundImage: `url(${encodeURI(backgroundMedia?.fileUrl || "")})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      <div className="absolute right-5 bottom-0 left-6 z-10 flex gap-4">
                        <PosterCard
                          poster={posterMedia?.fileUrl || ""}
                          withRibbon
                          className="h-[244px] w-[165px]"
                        />

                        <div className="flex flex-1 gap-5">
                          <div className="flex h-full w-full flex-col">
                            <div className="flex flex-3" />
                            <div className="flex flex-4 items-start gap-4">
                              <button className="cursor-pointer">
                                <CirclePlayIcon
                                  className="group-hover:text-custom-yellow-200 size-24 text-white"
                                  strokeWidth={1}
                                />
                              </button>
                              <div className="flex flex-1 flex-col gap-2 py-2">
                                <h1 className="font-roboto text-4xl text-white">
                                  {item.content.title}
                                </h1>
                                <p className="font-roboto text-muted-foreground text-lg">
                                  {item.content.description}
                                </p>
                                <div className="flex w-full items-center gap-1 pt-1">
                                  <ThumbsUpIcon className="text-muted-foreground size-4" />
                                  <span className="text-muted-foreground text-sm">
                                    12
                                  </span>
                                  <span className="w-1"></span>
                                  <HeartIcon
                                    className="size-5"
                                    fill="#F52765"
                                  />
                                  <span className="text-muted-foreground text-sm">
                                    44
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPreviousCustom />
            <CarouselNextCustom />
          </div>
        </Carousel>
      </div>

      {/* Carousel Mini ( Up Next Section ) */}
      {contentWithMedia.length > 1 && (
        <div className="hidden min-h-full w-full flex-3 flex-col gap-8 lg:flex">
          <h2 className="text-custom-yellow-100 mt-1 font-sans text-xl font-semibold">
            Up next
          </h2>
          {/* new style */}
          <div className="relative flex flex-1">
            <div className="absolute inset-0 top-0 right-0 bottom-0 left-0 bg-gray-900 mask-b-from-5% mask-b-to-50%"></div>

            <Carousel
              setApi={setSideApi}
              orientation="vertical"
              opts={{
                loop: false,
                watchDrag: false,
                align: "start",
              }}
              className="h-full w-full"
            >
              <CarouselContent className="flex w-full gap-5 p-5">
                {getUpNextItems(currentMainIndex).map((item, index) => {
                  const posterMedia = item.media.find(
                    (m) => m.mediaCategory === "poster",
                  );

                  return (
                    <CarouselItem
                      key={`${item.content.id}-${currentMainIndex}-${index}`}
                    >
                      <Link
                        to="/content/$contentId"
                        params={{ contentId: item.content.id }}
                      >
                        <TrailerCard
                          duration="1:25"
                          title={item.content.title}
                          poster={posterMedia?.fileUrl || ""}
                        />
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </div>

          {/* button */}
          <button className="hover:text-custom-yellow-200 ml-5 flex w-fit cursor-pointer items-center text-left font-sans text-xl font-semibold text-white">
            Browse trailers
            <ChevronRightIcon className="ml-1 size-5" strokeWidth={3} />
          </button>
        </div>
      )}
    </section>
  );
};

export default CarouselSection;
