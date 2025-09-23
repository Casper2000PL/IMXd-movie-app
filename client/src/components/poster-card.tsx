// Updated PosterCard component with two separate clickable areas
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { forwardRef } from "react";

interface PosterCardProps {
  poster: string;
  className?: string;
  classNameImg?: string;
  withRibbon?: boolean;
  onRibbonClick?: () => void; // Handler for ribbon click
  onPosterClick?: () => void; // Handler for poster click (fallback if not using as Dialog trigger)
}

const PosterCard = forwardRef<HTMLDivElement, PosterCardProps>(
  (
    {
      poster,
      className,
      classNameImg,
      withRibbon,
      onRibbonClick,
      onPosterClick,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-[244px] w-[165px] cursor-pointer justify-center rounded-md rounded-tl-none transition duration-200 hover:opacity-90",
          className,
        )}
        onClick={onPosterClick}
        {...props}
      >
        <img
          src={poster}
          alt="Poster"
          className={cn(
            "pointer-events-none h-full w-full rounded-md rounded-tl-none object-cover", // pointer-events-none to prevent conflicts
            classNameImg,
          )}
        />

        {/* Ribbon Button - separate clickable area */}
        {withRibbon && (
          <button
            className="absolute top-0 left-0 z-10 flex h-14 w-10 cursor-pointer bg-neutral-800/90 transition duration-150 hover:bg-neutral-500/90"
            style={{
              clipPath:
                "polygon(0% 0%, 100% 0%, 100% 100%, 50% calc(100% - 12px), 0% 100%, 0% calc(100% - 12px))",
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the poster click
              onRibbonClick?.();
            }}
            aria-label="Add to collection" // Accessibility
          >
            <PlusIcon
              className="pointer-events-none absolute top-2 left-[5px] size-7 text-white"
              strokeWidth={2.5}
            />
          </button>
        )}
      </div>
    );
  },
);

PosterCard.displayName = "PosterCard";

export default PosterCard;
