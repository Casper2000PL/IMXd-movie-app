import { ListIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNextCustom,
  CarouselPreviousCustom,
} from "../ui/carousel";

interface FeaturedTodaySectionProps {
  posters: string[];
}

const FeaturedTodaySection = ({ posters }: FeaturedTodaySectionProps) => {
  return (
    <section className="flex w-full flex-col gap-5">
      <h1 className="text-custom-yellow-100 font-roboto text-2xl font-bold xl:text-3xl">
        Featured today
      </h1>
      <div className="flex gap-10 pr-5">
        <Carousel
          opts={{
            loop: false,
            watchDrag: false,
            align: "start",
          }}
          className="flex max-w-205 min-w-100 justify-center"
        >
          <CarouselContent className="m-0 flex h-full w-full gap-2 p-0 max-md:w-100">
            <CarouselItem className="basis-1/1 p-0 md:basis-1/2">
              {/* First Item */}
              <div className="flex p-0">
                <div className="w-100">
                  <div className="group relative grid cursor-pointer grid-cols-3 overflow-clip rounded-xl transition duration-300 hover:opacity-85">
                    <div key={posters[0]} className="border-r-4 border-white">
                      <img
                        src={posters[0]}
                        alt="Poster 1"
                        className="h-full w-full mask-b-from-80% mask-b-to-100% object-cover"
                      />
                    </div>
                    <div key={posters[1]} className="border-r-4 border-white">
                      <img
                        src={posters[1]}
                        alt="Poster 2"
                        className="h-full w-full mask-b-from-80% mask-b-to-100% object-cover"
                      />
                    </div>
                    <div key={posters[2]}>
                      <img
                        src={posters[2]}
                        alt="Poster 3"
                        className="h-full w-full mask-b-from-80% mask-b-to-100% object-cover"
                      />
                    </div>
                    <div className="absolute bottom-2 left-3 z-20 flex w-full items-center gap-3">
                      <ListIcon
                        className="group-hover:text-custom-yellow-200 size-6 text-white"
                        strokeWidth={2}
                      />
                      <span className="font-noto-sans text-sm text-white">
                        List
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 w-full px-2">
                    <h2 className="font-noto-sans cursor-pointer text-lg text-white hover:underline">
                      Staff Picks: What to Watch in August
                    </h2>
                    <h2 className="font-noto-sans mt-1 cursor-pointer text-lg text-blue-400 hover:underline">
                      See our picks
                    </h2>
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="basis-1/1 p-0 md:basis-1/2">
              {/* Third Item */}
              <div className="flex p-0">
                <div className="w-100">
                  <div className="group relative grid cursor-pointer grid-cols-3 overflow-clip rounded-xl transition duration-300 hover:opacity-85">
                    <div key={posters[3]} className="border-r-4 border-white">
                      <img
                        src={posters[3]}
                        alt="Poster 4"
                        className="h-full w-full mask-b-from-80% mask-b-to-100% object-cover"
                      />
                    </div>
                    <div key={posters[1]} className="border-r-4 border-white">
                      <img
                        src={posters[1]}
                        alt="Poster 2"
                        className="h-full w-full mask-b-from-80% mask-b-to-100% object-cover"
                      />
                    </div>
                    <div key={posters[0]}>
                      <img
                        src={posters[0]}
                        alt="Poster 1"
                        className="h-full w-full mask-b-from-80% mask-b-to-100% object-cover"
                      />
                    </div>
                    <div className="absolute bottom-2 left-3 z-20 flex w-full items-center gap-3">
                      <ListIcon
                        className="group-hover:text-custom-yellow-200 size-6 text-white"
                        strokeWidth={2}
                      />
                      <span className="font-noto-sans text-sm text-white">
                        List
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 w-full px-2">
                    <h2 className="font-noto-sans cursor-pointer text-lg text-white hover:underline">
                      Staff Picks: What to Watch in August
                    </h2>
                    <h2 className="font-noto-sans mt-1 cursor-pointer text-lg text-blue-400 hover:underline">
                      See our picks
                    </h2>
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="basis-1/1 p-0 md:basis-1/2">
              {/* Second Item */}
              <div className="flex h-full p-4">
                <div className="h-full w-100 bg-blue-400">asd</div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPreviousCustom className="top-2/5" />
          <CarouselNextCustom className="top-2/5" />
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedTodaySection;
