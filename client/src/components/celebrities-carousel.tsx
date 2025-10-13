import CelebCard from "./celeb-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNextCustom,
  CarouselPreviousCustom,
} from "./ui/carousel";

interface Person {
  id: string;
  name: string;
  biography: string | null;
  birthDate: string | null;
  profileImageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Actor {
  person: Person | undefined;
  id: string;
  contentId: string;
  personId: string;
  role: "producer" | "actor" | "director" | "writer";
  characterName: string | null;
  creditOrder: number | null;
  personName: string | null;
  personProfileImageUrl: string | null;
  createdAt: string | null;
}

const CelebritiesCarousel = ({ actors }: { actors: Actor[] }) => {
  return (
    <Carousel
      className="w-full"
      opts={{
        loop: false,
        align: "start",
        slidesToScroll: 1,
      }}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {actors.map((actor) => (
          <CarouselItem
            key={actor.id}
            className="basis-full pl-2 sm:basis-1/2 md:basis-1/3 md:pl-4 lg:basis-1/4 xl:basis-1/5"
          >
            <CelebCard
              name={actor.personName!}
              image={actor.personProfileImageUrl!}
              characterName={actor.characterName!}
              lightMode={true}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPreviousCustom />
      <CarouselNextCustom />
    </Carousel>
  );
};

export default CelebritiesCarousel;
