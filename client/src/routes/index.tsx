import PosterCard from "@/components/poster-card";
import CarouselSection from "@/components/sections/CarouselSection";
import FeaturedTodaySection from "@/components/sections/FeaturedTodaySection";
import { allPosters } from "@/lib/images-data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full justify-center bg-black">
      <div className="flex h-full w-full max-w-7xl flex-col gap-15 max-xl:px-2">
        {/* Carousel Section */}
        <CarouselSection />

        {/* Featured Today Section */}
        <FeaturedTodaySection />

        <div className="mb-20 flex w-full gap-10">
          {allPosters.map((poster) => (
            <PosterCard key={poster} poster={poster} withRibbon />
          ))}
        </div>
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
