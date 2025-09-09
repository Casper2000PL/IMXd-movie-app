import { Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselNextCustom,
  CarouselPreviousCustom,
} from "../ui/carousel";

const CelebritiesSection = () => {
  return (
    <section className="flex w-full flex-col gap-5 py-10">
      <div className="flex w-full items-center pb-4">
        <div className="bg-custom-yellow-100 h-7 w-1 rounded-full" />
        <Link
          to="/"
          className="group font-noto-sans ml-2 flex items-center gap-1 text-2xl font-semibold text-white"
        >
          Most popular celebrities
          <ChevronRightIcon
            className="group-hover:text-custom-yellow-200 size-7 text-white transition duration-200"
            strokeWidth={2.8}
          />
        </Link>
      </div>
      <Carousel
        className="m-0 flex w-full justify-center p-0"
        opts={{
          loop: false,
          watchDrag: false,
          align: "start",
        }}
      >
        <CarouselContent className="w-full p-0">
          {/* {celebsDB.map((celeb, index) => (
            <CarouselItem
              key={index}
              className="basis-full p-0 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <div className="flex justify-center p-1">
                <CelebCard name={celeb.name} image={celeb.image} />
              </div>
            </CarouselItem>
          ))} */}
        </CarouselContent>
        <CarouselNextCustom />
        <CarouselPreviousCustom />
      </Carousel>
    </section>
  );
};

export default CelebritiesSection;
