import { Link } from "@tanstack/react-router";
import { PlusIcon, StarIcon } from "lucide-react";

const TopRatedEpisodeCard = () => {
  return (
    <div className="h-46.5 flex-1 rounded-[3px] border-1 border-stone-300 bg-white p-4 shadow-sm">
      <div className="flex h-full w-full flex-col">
        <div className="relative mb-3 pl-11">
          <button
            className="absolute top-0 left-0 z-10 flex h-11 w-8 cursor-pointer bg-stone-300/60 transition duration-150 hover:bg-stone-400/50"
            style={{
              clipPath:
                "polygon(0% 0%, 100% 0%, 100% 100%, 50% calc(100% - 12px), 0% 100%, 0% calc(100% - 12px))",
            }}
            onClick={() => {}}
            aria-label="Add to collection"
          >
            <PlusIcon
              className="pointer-events-none absolute top-2 left-[6px] size-5 text-stone-800"
              strokeWidth={2.5}
            />
          </button>
          <div className="flex flex-col gap-1.5">
            <p className="bg-custom-yellow-100 font-roboto flex w-fit rounded-[3px] pr-14 pl-3 text-[12px] font-bold tracking-[2px]">
              TOP-RATED
            </p>
            <p className="font-roboto text-sm text-stone-500">
              Fri, May 1, 2020
            </p>
          </div>
        </div>
        <div className="gap flex flex-col gap-0.5">
          <Link
            to="/"
            className="font-roboto flex items-center gap-2 text-base font-semibold text-black hover:text-black/60"
          >
            <p>S1.E10</p>
            <div className="size-[2px] rounded-full bg-black" />
            <p>Episode Name</p>
          </Link>
          <div className="font-roboto text-base text-stone-600/70">
            After his premature death, a man's consciousness is uploaded into a
            virtual world.
          </div>
          <div className="mt-1 flex gap-2">
            <div className="flex items-center gap-1">
              <StarIcon
                fill="currentColor"
                className="text-custom-yellow-100 size-4"
              />
              <p className="text-base tracking-[1px] text-stone-600/80">
                4.5/10
              </p>
            </div>
            <button className="font-roboto flex cursor-pointer items-center gap-1 text-blue-500 transition-all duration-300 hover:bg-stone-300/80">
              <StarIcon className="size-4 text-blue-500" strokeWidth={2.5} />
              Rate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopRatedEpisodeCard;
