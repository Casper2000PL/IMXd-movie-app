/* eslint-disable @typescript-eslint/no-unused-vars */

import { mockDb, steveImages } from "@/lib/images-data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNextCustom,
  CarouselPreviousCustom,
  type CarouselApi,
} from "../ui/carousel";
import PosterCard from "../poster-card";
import { CirclePlayIcon, HeartIcon, ThumbsUpIcon } from "lucide-react";

const CarouselSection = () => {
  const steveImage1 = steveImages[0];

  return (
    <section className="mt-2 flex max-h-200 min-h-140 w-full gap-2 max-lg:px-2">
      {/* Carousel Big */}
      <div className="flex min-h-full w-full flex-3">
        <Carousel
          className="h-full w-full flex-1"
          opts={{
            loop: true,
          }}
        >
          <div className="h-full w-full">
            <CarouselContent className="m-0 h-full w-full p-0">
              {mockDb.map((movie) => (
                <CarouselItem
                  key={movie.id}
                  className="relative min-h-150 w-full cursor-pointer overflow-visible p-0"
                >
                  <div
                    className="flex h-120 w-full items-center justify-center rounded-md mask-b-from-50% mask-b-to-90% transition duration-300 hover:opacity-90"
                    style={{
                      backgroundImage: `url(${movie.images[0]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="absolute right-5 bottom-0 left-5 z-10 flex gap-4">
                    <PosterCard poster={movie.poster} />
                    <div className="flex flex-1 gap-5">
                      <div className="flex h-full w-full flex-col">
                        <div className="flex flex-3" />
                        <div className="flex flex-4 items-start gap-4">
                          <button className="cursor-pointer">
                            <CirclePlayIcon
                              className="hover:text-custom-yellow-200 size-24 text-white"
                              strokeWidth={1}
                            />
                          </button>
                          <div className="flex flex-1 flex-col gap-2 py-2">
                            <h1 className="font-roboto text-4xl text-white">
                              {movie.title}
                            </h1>
                            <p className="font-roboto text-muted-foreground">
                              {movie.description}
                            </p>
                            <div className="flex w-full items-center gap-1 pt-1">
                              <ThumbsUpIcon className="text-muted-foreground size-4" />
                              <span className="text-muted-foreground text-sm">
                                12
                              </span>
                              <span className="w-1"></span>
                              <HeartIcon className="size-5" fill="#F52765" />
                              <span className="text-muted-foreground text-sm">
                                44
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
              {/* <CarouselItem className="relative min-h-150 w-full cursor-pointer overflow-visible p-0">
                <div
                  className="flex h-120 w-full items-center justify-center rounded-md mask-b-from-50% mask-b-to-90% transition duration-300 hover:opacity-90"
                  style={{
                    backgroundImage: `url(${steveImage1})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <div className="absolute right-5 bottom-0 left-5 z-10 flex gap-4">
                  <PosterCard poster={stevePoster} />
                  <div className="flex flex-1 gap-5">
                    <div className="flex h-full w-full flex-col">
                      <div className="flex flex-3" />
                      <div className="flex flex-4 items-start gap-4">
                        <button className="cursor-pointer">
                          <CirclePlayIcon
                            className="hover:text-custom-yellow-200 size-24 text-white"
                            strokeWidth={1}
                          />
                        </button>
                        <div className="flex flex-1 flex-col gap-2 py-2">
                          <h1 className="font-roboto text-4xl text-white">
                            Some long title
                          </h1>
                          <p className="font-roboto text-muted-foreground">
                            some description asdasd
                          </p>
                          <div className="flex w-full items-center gap-1 pt-1">
                            <ThumbsUpIcon className="text-muted-foreground size-4" />
                            <span className="text-muted-foreground text-sm">
                              12
                            </span>
                            <span className="w-1"></span>
                            <HeartIcon className="size-5" fill="#F52765" />
                            <span className="text-muted-foreground text-sm">
                              44
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem> */}
            </CarouselContent>
            <CarouselPreviousCustom />
            <CarouselNextCustom />
          </div>
        </Carousel>
      </div>
      {/* Carousel Mini ( Up Next Section ) */}
      <div className="hidden min-h-full w-full flex-1 bg-red-300 lg:flex"></div>
    </section>
  );
};

export default CarouselSection;
