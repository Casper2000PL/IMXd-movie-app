import { getCastCrewByContentId } from "@/api/cast-crew";
import { getContentById } from "@/api/content";
import { getContentGenres } from "@/api/content-genres";
import { getMediaByContentId } from "@/api/media";
import { getPersonById } from "@/api/people";
import AddToListModal from "@/components/add-to-list-modal";
import AddToWatchlistBtn from "@/components/add-to-watchlist-btn";
import CastLink from "@/components/cast-link";
import CelebritiesCarousel from "@/components/celebrities-carousel";
import ImageGallery from "@/components/image-gallery";
import MarkAsWatchedBtn from "@/components/mark-as-watched-btn";
import ModalWithChildren from "@/components/modal-with-children";
import PosterCard from "@/components/poster-card";
import SectionLink from "@/components/section-link";
import TopRatedEpisodeCard from "@/components/top-rated-episode-card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNextCustom,
  CarouselPreviousCustom,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { convertToEmbedUrl } from "@/utils/convertToEmbedUrl";
import { formatRuntime } from "@/utils/dateUtils";
import { DialogClose } from "@radix-ui/react-dialog";

import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDate, getYear } from "date-fns";
import {
  ChevronRightIcon,
  ClapperboardIcon,
  ImageIcon,
  ImageOffIcon,
  SettingsIcon,
  StarIcon,
  TrendingUpIcon,
  TriangleIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import type { User } from "shared/src/types";

export const Route = createFileRoute("/content/$contentId/")({
  loader: async ({ params }) => {
    const [contentData, mediaData, castCrewData, genresData] =
      await Promise.all([
        getContentById(params.contentId),
        getMediaByContentId(params.contentId),
        getCastCrewByContentId(params.contentId),
        getContentGenres(params.contentId),
      ]);

    // Handle undefined or null responses
    const validCastCrewData = castCrewData || [];
    const validMediaData = mediaData || [];

    // Fetch all people data for cast/crew members
    const peopleIds = [...new Set(validCastCrewData.map((cc) => cc.personId))];
    const peopleData = await Promise.all(
      peopleIds.map((id) => getPersonById(id)),
    );

    // Create a map for easy lookup, filtering out any undefined results
    const peopleMap = new Map(
      peopleData
        .filter((person) => person)
        .map((person) => [person!.id, person!]),
    );

    // Enrich cast/crew data with people information
    const enrichedCastCrew = validCastCrewData.map((cc) => ({
      ...cc,
      person: peopleMap.get(cc.personId),
    }));

    return {
      content: contentData,
      media: validMediaData,
      castCrew: enrichedCastCrew,
      genres: genresData,
    };
  },

  component: ContentDetailsComponent,
});

function ContentDetailsComponent() {
  const { data: session } = authClient.useSession();
  const user = session?.user as User;
  console.log("User info: ", user);

  const { content, media, castCrew, genres } = Route.useLoaderData();
  const { contentId } = Route.useParams();

  console.log("Content data:", content);
  console.log("Media data:", media);
  console.log("Cast/Crew data:", castCrew);
  console.log("Genres data:", genres);

  // Filter cast/crew by role
  const directors = castCrew.filter((cc) => cc.role === "director");
  const writers = castCrew.filter((cc) => cc.role === "writer");
  const actors = castCrew.filter((cc) => cc.role === "actor").slice(0, 3); // Top 3 stars
  const topCast = castCrew.filter((cc) => cc.role === "actor").slice(0, 18);

  console.log(actors);

  const videos = media.filter((m) => m.type === "video");
  const postersImages = media.filter((m) => m.mediaCategory === "poster");
  const images = media.filter((m) => m.type === "image");
  const trailers = media.filter((m) => m.mediaCategory === "trailer");
  const galleryImages = media.filter(
    (m) => m.mediaCategory === "gallery_image",
  );

  const carouselImages = [...galleryImages, ...postersImages];

  const [isOpenAddToListModal, setIsOpenAddToListModal] = useState(false);
  const [isOpenGalleryModal, setIsOpenGalleryModal] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isOpenPosterGalleryModal, setIsOpenPosterGalleryModal] =
    useState(false);

  return (
    <div className="relative w-full">
      {/* Dark Section */}
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
        <div className="xs:px-4 relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-4 md:px-8">
          {/* Text */}
          <div className="flex w-full justify-between">
            <div>
              <h1 className="font-roboto text-4xl text-white sm:text-5xl">
                {content.title}
              </h1>
              <div className="mt-1 flex items-center gap-[6px] font-sans text-sm text-white/70">
                {content && content.releaseDate !== null && (
                  <span>{getYear(content.releaseDate?.toString())}</span>
                )}

                <div className="bg-muted-foreground size-[3px] rounded-full" />
                <span>{content.runtime && formatRuntime(content.runtime)}</span>
              </div>
            </div>
            <div className="hidden gap-1.5 lg:flex">
              {/* rating */}
              <div className="flex flex-col items-center gap-0.5">
                <p className="text-center font-sans text-sm font-semibold tracking-wider text-stone-400">
                  IMXd RATING
                </p>
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
            {/* 366 224 lg:max-h-[600px] lg:min-h-[224px]*/}
            <div className="max-xs:max-h-[400px] max-xs:min-h-[250px] xs:max-h-[600px] xs:min-h-[300px] flex w-full gap-1 sm:max-h-[600px] sm:min-h-[300px]">
              {/* Poster Card */}
              <div className="hidden flex-1 sm:flex">
                {postersImages.length > 0 ? (
                  <PosterCard
                    poster={postersImages[0].fileUrl}
                    className="z-1 h-full w-full"
                    withRibbon
                    onRibbonClick={() => {
                      console.log("Add to collection clicked");
                    }}
                    onPosterClick={() => setIsOpenPosterGalleryModal(true)}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-md bg-gray-800">
                    <ImageOffIcon className="size-6 text-white" />
                    <p className="text-center font-sans text-lg font-semibold text-white">
                      No <br />
                      poster available
                    </p>
                  </div>
                )}
              </div>
              {/* Trailer frame */}
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
                  <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-800">
                    <p className="font-sans text-xl font-semibold text-white">
                      No trailer
                    </p>
                  </div>
                )}
              </div>
              <div className="hidden flex-1 flex-col gap-1 lg:flex">
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
                <button
                  className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-4 rounded-md bg-white/10 transition-all duration-200 hover:bg-white/25"
                  onClick={() => {
                    setIsOpenGalleryModal(true);
                    setGalleryIndex(0);
                  }}
                >
                  <ImageIcon className="size-8 text-white" />
                  <p className="font-sans text-sm font-semibold text-white">
                    <span>{carouselImages.length}</span>{" "}
                    {carouselImages.length === 1 ? "IMAGE" : "IMAGES"}
                  </p>
                </button>
              </div>
            </div>
            <div className="mt-2 flex gap-1 lg:hidden">
              <Link
                to="/"
                className="flex flex-1 items-center justify-center gap-4 rounded-full bg-white/10 py-3 transition-all duration-200 hover:bg-white/25"
              >
                <ClapperboardIcon className="size-4 text-white" />
                <p className="font-sans text-sm font-semibold text-white">
                  <span>{videos.length}</span>{" "}
                  {videos.length === 1 ? "VIDEO" : "VIDEOS"}
                </p>
              </Link>
              <button
                className="flex flex-1 items-center justify-center gap-4 rounded-full bg-white/10 transition-all duration-200 hover:bg-white/25"
                onClick={() => {
                  setIsOpenGalleryModal(true);
                  setGalleryIndex(0);
                }}
              >
                <ImageIcon className="size-4 text-white" />
                <p className="font-sans text-sm font-semibold text-white">
                  <span>{carouselImages.length}</span>{" "}
                  {carouselImages.length === 1 ? "IMAGE" : "IMAGES"}
                </p>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex w-full flex-col">
            <div className="mt-4 flex w-full gap-14">
              {/* Genres Description and Cast */}
              <div className="w-full flex-7">
                <div className="mt-2 flex gap-4">
                  <div className="hidden max-h-44.5 min-h-35 max-w-30 min-w-23.75 max-sm:flex">
                    {postersImages[0] ? (
                      <PosterCard
                        poster={postersImages[0].fileUrl}
                        withRibbon
                        className="rounded-xl! rounded-tl-none!"
                        classNameImg="rounded-xl! rounded-tl-none!"
                        onRibbonClick={() => {
                          console.log("Add to collection clicked");
                        }}
                        onPosterClick={() => setIsOpenPosterGalleryModal(true)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-800">
                        <p className="text-center font-sans text-xl font-semibold text-white">
                          No <br />
                          poster available
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    {/* Genres Badges */}
                    <div className="mb-4 flex w-full flex-1 gap-3">
                      {genres.map((genre) => (
                        <Link
                          to="/"
                          key={genre.id}
                          className="rounded-full border-1 border-stone-300 px-3 py-0.5 font-sans text-sm text-white hover:bg-white/10"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                    {/* Description */}
                    <div className="font-medium text-white">
                      {content.description}
                    </div>
                    <div className="mt-4 mb-1 flex items-center gap-2 lg:hidden">
                      <button className="flex cursor-pointer justify-between rounded-full px-4 py-1 transition-all duration-200 hover:bg-white/10">
                        <div className="flex items-center gap-1.5">
                          <StarIcon
                            className="size-5 text-yellow-500"
                            fill="currentColor"
                          />
                          <div className="flex flex-col">
                            <span className="font-roboto text-lg font-bold text-white">
                              {content.rating}
                              <span className="text-base font-normal text-stone-400">
                                /10
                              </span>
                            </span>
                          </div>
                        </div>
                      </button>
                      <button className="flex cursor-pointer gap-2.5 rounded-full px-2.5 py-1 transition-all duration-200 hover:bg-white/10">
                        <div className="flex items-center gap-1.5">
                          <TrendingUpIcon className="size-4 text-green-500" />
                          <span className="font-roboto text-lg font-bold text-white">
                            1,234
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TriangleIcon
                            className="size-[6px] text-[#A1A1A1]"
                            fill="#A1A1A1"
                          />
                          <p className="font-roboto text-sm font-medium text-stone-400">
                            4,567
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Creators and Cast */}
                <div className="my-3 flex flex-col">
                  <Separator className="bg-white/20" />

                  {/* Directors */}
                  {directors.length > 0 && (
                    <>
                      <div className="flex gap-3 py-3">
                        <p className="font-sans text-base font-semibold text-white">
                          {directors.length > 1 ? "Directors" : "Director"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {directors.map((director, idx) => (
                            <span
                              key={director.id}
                              className="flex items-center gap-2"
                            >
                              <Link
                                to="/"
                                className="text-blue-400 hover:underline"
                              >
                                {director.person?.name}
                              </Link>
                              {idx < directors.length - 1 && (
                                <div className="size-[2px] rounded-full bg-white" />
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Separator className="bg-white/20" />
                    </>
                  )}

                  {/* Writers */}
                  {writers.length > 0 && (
                    <>
                      <div className="flex gap-3 py-3">
                        <p className="font-sans text-base font-semibold text-white">
                          {writers.length > 1 ? "Writers" : "Writer"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {writers.map((writer, idx) => (
                            <span
                              key={writer.id}
                              className="flex items-center gap-2"
                            >
                              <Link
                                to="/"
                                className="text-blue-400 hover:underline"
                              >
                                {writer.person?.name}
                              </Link>
                              {idx < writers.length - 1 && (
                                <div className="size-[2px] rounded-full bg-white" />
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Separator className="bg-white/20" />
                    </>
                  )}

                  {/* Stars */}
                  {actors.length > 0 && (
                    <>
                      <div className="group relative flex flex-col justify-center gap-3 py-3 sm:flex-row sm:justify-start">
                        <Link
                          to="/"
                          className="z-20 w-fit font-sans text-base font-semibold text-white group-hover:text-white/60 hover:text-white/60"
                        >
                          Stars
                        </Link>
                        <div className="z-20 w-fit flex-wrap">
                          <ul className="flex flex-wrap items-center gap-3">
                            {actors.map((actor, idx) => (
                              <li
                                key={actor.id}
                                className="flex items-center gap-3"
                              >
                                <Link
                                  to="/"
                                  className="text-blue-400 hover:underline"
                                >
                                  {actor.person?.name}
                                </Link>
                                {idx < actors.length - 1 && (
                                  <div className="size-[2px] rounded-full bg-white" />
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Link
                          to="/"
                          className="hover:text-custom-yellow-300 group-hover:text-custom-yellow-300 absolute top-1/2 right-0 z-10 flex h-full w-full -translate-y-1/2 items-center justify-end pr-2 text-white"
                        >
                          <ChevronRightIcon
                            className="size-5"
                            strokeWidth={2.5}
                          />
                        </Link>
                      </div>
                      <Separator className="bg-white/20" />
                    </>
                  )}
                </div>
              </div>

              {/* Add to watchlist button */}
              <div className="hidden w-full flex-3 justify-start lg:flex">
                <div className="flex w-full flex-col gap-3">
                  {content.status === "upcoming" && (
                    <div className="flex items-center gap-2">
                      <div className="bg-custom-yellow-100 h-9 w-1 rounded-full" />
                      <div className="flex flex-col">
                        <p className="font-sans text-xs font-semibold tracking-[2px] text-white">
                          {content.status?.toUpperCase()}
                        </p>
                        {content && content.releaseDate !== null && (
                          <p className="font-sans text-sm font-medium text-white">
                            Expected{" "}
                            {formatDate(
                              content.releaseDate?.toString(),
                              "MMMM d, yyyy",
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <AddToWatchlistBtn
                    onClickModal={() => setIsOpenAddToListModal(true)}
                  />
                  <MarkAsWatchedBtn />
                </div>
              </div>
            </div>

            <div className="mt-4 flex w-full max-w-108 min-w-12 flex-2 items-center justify-center lg:hidden">
              <div className="flex w-full flex-col gap-2">
                {content.status === "upcoming" && (
                  <div className="flex items-center gap-2">
                    <div className="bg-custom-yellow-100 h-9 w-1 rounded-full" />
                    <div className="flex flex-col">
                      <p className="font-sans text-xs font-semibold tracking-[2px] text-white">
                        {content.status?.toUpperCase()}
                      </p>
                      {content && content.releaseDate !== null && (
                        <p className="font-sans text-sm font-medium text-white">
                          Expected{" "}
                          {formatDate(
                            content.releaseDate?.toString(),
                            "MMMM d, yyyy",
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <AddToWatchlistBtn
                  onClickModal={() => setIsOpenAddToListModal(true)}
                />
                <MarkAsWatchedBtn />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Settings Section */}
      {user !== undefined && user.role === "ADMIN" && (
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
      )}

      {/* White Section */}
      <div className="xs:px-4 w-full bg-stone-100/30 px-4 sm:px-4 md:px-8">
        <div className="mx-auto h-full w-full max-w-7xl py-6">
          <div className="flex min-h-[300px] w-full gap-14 px-2 xl:px-0">
            <div className="flex w-full flex-7 flex-col gap-y-15">
              {/* Episodes Section */}
              {content.type === "show" && content.numberOfEpisodes! > 0 && (
                <div className="w-full">
                  <div className="w-fit">
                    <SectionLink
                      label="Episodes"
                      numberOfItems={Number(content.numberOfEpisodes)}
                    />
                  </div>
                  <div className="mt-5 flex w-full items-center justify-start gap-4">
                    <TopRatedEpisodeCard />
                    <TopRatedEpisodeCard />
                  </div>
                </div>
              )}

              {/* Photos Section */}
              <div className="w-full">
                <div className="w-fit">
                  <SectionLink label="Photos" numberOfItems={images.length} />
                </div>
                {/* Image gallery */}
                <ImageGallery
                  images={carouselImages}
                  openModal={() => setIsOpenGalleryModal(true)}
                  setIndex={setGalleryIndex}
                />
              </div>
              {/* Top Cast Section */}
              <div className="w-full">
                <div className="w-fit">
                  <SectionLink
                    label="Top Cast"
                    numberOfItems={topCast.length}
                  />
                </div>

                {/* Cast Grid  */}
                <div className="hidden w-full lg:block">
                  {/* Grid 2 Cols 9 Rows */}
                  <div className="my-6 grid grid-cols-2 gap-5">
                    {topCast.map((actor) => (
                      <CastLink
                        key={actor.id}
                        imgUrl={actor.personProfileImageUrl || ""}
                        name={actor.person?.name || ""}
                        character={actor.characterName || ""}
                      />
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4">
                    View All
                  </Button>
                  <Button variant="yellow" className="ml-4">
                    View All
                  </Button>
                </div>
                <div className="mt-10 block lg:hidden">
                  <CelebritiesCarousel actors={topCast} />
                </div>
                {/* Other Cast Crew Details */}
                <div className="my-6 flex w-full flex-col">
                  <div className="my-3 flex flex-col">
                    <Separator className="bg-black/30" />
                    {/* Directors */}
                    {directors.length > 0 && (
                      <>
                        <div className="flex gap-3 py-1.5">
                          <p className="font-sans text-base font-semibold text-black">
                            {directors.length > 1 ? "Directors" : "Director"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {directors.map((director, idx) => (
                              <span
                                key={director.id}
                                className="flex items-center gap-2"
                              >
                                <Link
                                  to="/"
                                  className="text-blue-600 hover:underline"
                                >
                                  {director.person?.name}
                                </Link>
                                {idx < directors.length - 1 && (
                                  <div className="size-[2px] rounded-full bg-black" />
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    <Separator className="bg-black/30" />
                    {/* Writers */}
                    {writers.length > 0 && (
                      <>
                        <div className="flex gap-3 py-1.5">
                          <p className="font-sans text-base font-semibold text-black">
                            {writers.length > 1 ? "Writers" : "Writer"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {writers.map((writer, idx) => (
                              <span
                                key={writer.id}
                                className="flex items-center gap-2"
                              >
                                <Link
                                  to="/"
                                  className="text-blue-600 hover:underline"
                                >
                                  {writer.person?.name}
                                </Link>
                                {idx < writers.length - 1 && (
                                  <div className="size-[2px] rounded-full bg-black" />
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    <Separator className="bg-black/30" />
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden w-full flex-3 border-2 border-red-500 lg:flex"></div>
          </div>
        </div>
      </div>
      <AddToListModal
        isOpen={isOpenAddToListModal}
        setIsOpen={setIsOpenAddToListModal}
        posterUrl={postersImages[0].fileUrl!}
        title={content.title}
      />
      <ModalWithChildren
        isOpen={isOpenGalleryModal}
        setIsOpen={setIsOpenGalleryModal}
      >
        <div className="h-full w-full">
          <Carousel
            className="m-0 h-full w-full p-0"
            opts={{
              loop: true,
              watchDrag: false,
              duration: 0,
              startIndex: galleryIndex,
            }}
          >
            <CarouselContent className="m-0 flex h-full w-full p-0">
              {carouselImages.map((image, index) => (
                <CarouselItem key={index} className="w-full p-0">
                  <div className="flex h-full w-full flex-col gap-5">
                    <div className="flex w-full items-center justify-between px-2">
                      <DialogClose className="flex w-fit cursor-pointer items-center justify-center gap-1 rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-white/20 active:bg-white/30">
                        <XIcon className="size-5" strokeWidth={2.5} />
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
      </ModalWithChildren>
      <ModalWithChildren
        isOpen={isOpenPosterGalleryModal}
        setIsOpen={setIsOpenPosterGalleryModal}
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
                        <XIcon className="size-5" strokeWidth={2.5} />
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
      </ModalWithChildren>
    </div>
  );
}
