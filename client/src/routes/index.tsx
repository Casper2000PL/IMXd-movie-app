import PosterCard from "@/components/poster-card";
import CarouselSection from "@/components/sections/CarouselSection";
import { allPosters } from "@/lib/images-data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full justify-center bg-black">
      <div className="h-full w-full max-w-7xl px-4">
        {/* Carousel Section */}
        <CarouselSection />

        <div className="h-40"></div>

        <div className="flex w-full gap-10">
          {allPosters.map((poster) => (
            <PosterCard key={poster} poster={poster} />
          ))}
        </div>

        <div className="h-20"></div>
      </div>

      {/* Featured Today Section */}
      {/* Most Popular Celebrities Section */}
      {/* What to watch Section */}
      {/* From your Watchlist Section */}
      {/* Top 10 on IMDb this week Section */}
      {/* Fan favorites Section */}
      {/* Popular interests Section */}
      {/* Exclusive videos Section */}
      {/* Explore what’s streaming Section */}
      {/* Explore Movies & TV shows Section */}
      {/* More to explore Section */}
      {/* Explore what’s streaming Section */}
    </div>
  );
}
