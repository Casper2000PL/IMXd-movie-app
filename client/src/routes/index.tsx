import { getContent } from "@/api/content";
import { getMedia } from "@/api/media";
import { getPeople } from "@/api/people";
import PosterCard from "@/components/poster-card";
import CarouselSection from "@/components/sections/CarouselSection";
import CelebritiesSection from "@/components/sections/CelebritiesSection";
import FeaturedTodaySection from "@/components/sections/FeaturedTodaySection";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [contentData, mediaData, peopleData] = await Promise.all([
      getContent(),
      getMedia(),
      getPeople(),
    ]);

    return {
      content: contentData,
      media: mediaData,
      people: peopleData,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { content, media, people } = Route.useLoaderData();

  console.log("Content data:", content);
  console.log("Media data:", media);
  console.log("People data:", people);

  const posters = media.filter((item) => item.mediaCategory === "poster");

  console.log("Posters:", posters);

  return (
    <div className="flex h-full w-full justify-center bg-black">
      <div className="flex h-full w-full max-w-7xl flex-col gap-15 max-xl:px-2">
        {/* Carousel Section */}
        <CarouselSection content={content} media={media} />

        {/* Featured Today Section */}
        <FeaturedTodaySection
          posters={posters.map((poster) => poster.fileUrl)}
        />

        {/* Most Popular Celebrities Section */}
        {people && people.length > 0 && <CelebritiesSection people={people} />}

        <div className="mb-20 flex w-full gap-10">
          {posters.length > 0 &&
            posters.map((poster) => (
              <Link
                to="/content/$contentId"
                params={{ contentId: poster.contentId! }}
                key={poster.id}
              >
                <PosterCard poster={poster.fileUrl} withRibbon />
              </Link>
            ))}
        </div>
      </div>

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
