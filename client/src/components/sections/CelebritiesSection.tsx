import { Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNextCustom,
  CarouselPreviousCustom,
} from "../ui/carousel";
import CelebCard from "../celeb-card";

interface Person {
  id: string;
  name: string;
  biography: string | null;
  birthDate: string | null;
  profileImageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

const CelebritiesSection = ({ people }: { people: Person[] }) => {
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
        className="w-full"
        opts={{
          loop: false,
          align: "start",
          slidesToScroll: 1,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {people.map((celeb) => (
            <CarouselItem
              key={celeb.id}
              className="basis-full pl-2 sm:basis-1/2 md:basis-1/3 md:pl-4 lg:basis-1/4 xl:basis-1/5"
            >
              <CelebCard name={celeb.name} image={celeb.profileImageUrl!} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPreviousCustom />
        <CarouselNextCustom />
      </Carousel>
    </section>
  );
};

export default CelebritiesSection;
